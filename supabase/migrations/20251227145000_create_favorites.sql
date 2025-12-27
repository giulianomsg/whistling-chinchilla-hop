-- Create user_favorite_foods table
CREATE TABLE IF NOT EXISTS "public"."user_favorite_foods" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    "user_id" uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    "food_id" uuid REFERENCES public.foods_library(id) ON DELETE CASCADE NOT NULL,
    "created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE("user_id", "food_id")
);

-- RLS Policies
ALTER TABLE "public"."user_favorite_foods" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own favorites" 
ON "public"."user_favorite_foods" 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites" 
ON "public"."user_favorite_foods" 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" 
ON "public"."user_favorite_foods" 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add indexes
CREATE INDEX IF NOT EXISTS "idx_user_favorite_foods_user" ON "public"."user_favorite_foods" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_user_favorite_foods_food" ON "public"."user_favorite_foods" ("food_id");
