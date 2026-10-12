CREATE TABLE IF NOT EXISTS public.env_vault (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key_name text UNIQUE NOT NULL,
  key_value text,
  description text,
  is_active boolean NOT NULL DEFAULT false,
  is_required boolean NOT NULL DEFAULT false,
  platform_group text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.env_vault TO service_role;
ALTER TABLE public.env_vault ENABLE ROW LEVEL SECURITY;
CREATE TABLE IF NOT EXISTS public.ai_chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id text,
  user_prompt text NOT NULL,
  ai_response text,
  provider text,
  action_type text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.ai_chats TO service_role;
ALTER TABLE public.ai_chats ENABLE ROW LEVEL SECURITY;
INSERT INTO public.env_vault (key_name, description, platform_group, is_required) VALUES
('OPENROUTER_API_KEY','OpenRouter free key (sk-or-v1-...) from openrouter.ai/keys','ai_builder',true),
('GROQ_API_KEY','Groq free key (gsk_...) from console.groq.com/keys - backup','ai_builder',true),
('TIKTOK_CLIENT_KEY','TikTok Client Key - developers.tiktok.com > My Apps','tiktok',false),
('TIKTOK_CLIENT_SECRET','TikTok Client Secret - same page','tiktok',false),
('FACEBOOK_APP_ID','Facebook App ID - powers Facebook Page + Instagram','facebook_instagram',false),
('FACEBOOK_APP_SECRET','Facebook App Secret - same page','facebook_instagram',false),
('GOOGLE_CLIENT_ID','Google OAuth Client ID for YouTube','youtube',false),
('GOOGLE_CLIENT_SECRET','Google OAuth Client Secret for YouTube','youtube',false),
('LINKEDIN_CLIENT_ID','LinkedIn Client ID','linkedin',false),
('LINKEDIN_CLIENT_SECRET','LinkedIn Client Secret','linkedin',false),
('X_API_KEY','X (Twitter) API Key','twitter',false),
('X_API_SECRET','X (Twitter) API Secret','twitter',false),
('CLOUDFLARE_R2_ACCOUNT_ID','Cloudflare R2 Account ID (optional)','storage',false),
('CLOUDFLARE_R2_ACCESS_KEY','Cloudflare R2 Access Key (optional)','storage',false),
('CLOUDFLARE_R2_SECRET_KEY','Cloudflare R2 Secret Key (optional)','storage',false),
('RESEND_API_KEY','Resend API Key (optional)','email',false)
ON CONFLICT (key_name) DO NOTHING;