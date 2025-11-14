import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, targetLanguage, entityId, entityType, fieldName } = await req.json();

    console.log('Translation request:', { targetLanguage, entityType, fieldName });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Check cache first
    const { data: cachedTranslation } = await supabase
      .from('translations')
      .select('translated_text')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .eq('field_name', fieldName)
      .eq('language', targetLanguage)
      .maybeSingle();

    if (cachedTranslation) {
      console.log('Returning cached translation');
      return new Response(
        JSON.stringify({ translatedText: cachedTranslation.translated_text, cached: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Get API configuration from restaurant settings
    const { data: settings } = await supabase
      .from('restaurant_settings')
      .select('*')
      .single();

    if (!settings) {
      throw new Error('Restaurant settings not found');
    }

    const translationApiKey = settings.translation_api_key;
    const translationService = settings.translation_service || 'google';

    if (!translationApiKey) {
      return new Response(
        JSON.stringify({ error: 'Translation API key not configured' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Call external translation API
    let translatedText = '';

    if (translationService === 'google') {
      const response = await fetch(
        `https://translation.googleapis.com/language/translate/v2?key=${translationApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            q: text,
            target: targetLanguage,
            format: 'text',
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        console.error('Google Translate error:', error);
        throw new Error('Translation API error');
      }

      const data = await response.json();
      translatedText = data.data.translations[0].translatedText;
    } else if (translationService === 'deepl') {
      const response = await fetch('https://api-free.deepl.com/v2/translate', {
        method: 'POST',
        headers: {
          'Authorization': `DeepL-Auth-Key ${translationApiKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          text,
          target_lang: targetLanguage.toUpperCase(),
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('DeepL error:', error);
        throw new Error('Translation API error');
      }

      const data = await response.json();
      translatedText = data.translations[0].text;
    } else {
      throw new Error('Unsupported translation service');
    }

    // 4. Save to cache
    const { error: insertError } = await supabase
      .from('translations')
      .insert({
        entity_type: entityType,
        entity_id: entityId,
        field_name: fieldName,
        language: targetLanguage,
        translated_text: translatedText,
        is_auto_translated: true,
        translation_service: translationService,
      });

    if (insertError) {
      console.error('Error saving translation:', insertError);
    }

    return new Response(
      JSON.stringify({ translatedText, cached: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in translate function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
