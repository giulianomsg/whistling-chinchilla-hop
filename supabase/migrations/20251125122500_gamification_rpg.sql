-- Function to calculate Level from XP
CREATE OR REPLACE FUNCTION public.calculate_level(xp integer) RETURNS integer AS $$
BEGIN
    -- Simple formula: Level = sqrt(XP / 100)
    -- Example: 100 XP = Lvl 1, 400 XP = Lvl 2, 2500 XP = Lvl 5, 10000 XP = Lvl 10
    IF xp < 100 THEN RETURN 1; END IF;
    RETURN FLOOR(SQRT(xp / 100.0));
END;
$$ LANGUAGE plpgsql;

-- Function to get Rank Title
CREATE OR REPLACE FUNCTION public.get_rank_title(level integer) RETURNS text AS $$
BEGIN
    IF level <= 5 THEN RETURN 'Novato de Sofá';
    ELSIF level <= 10 THEN RETURN 'Caminhante de Fim de Semana';
    ELSIF level <= 20 THEN RETURN 'Rato de Academia';
    ELSIF level <= 30 THEN RETURN 'Maratonista de Dados';
    ELSIF level <= 50 THEN RETURN 'Ciborgue Fitness';
    ELSE RETURN 'Lenda Viva';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update Level on Profile XP change
CREATE OR REPLACE FUNCTION public.trigger_update_level() RETURNS TRIGGER AS $$
BEGIN
    NEW.level := public.calculate_level(NEW.current_xp);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profile_level
    BEFORE INSERT OR UPDATE OF current_xp ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_update_level();

-- Seed Achievements
INSERT INTO public.achievements (code, name, description, xp_reward, criteria) VALUES
('LEG_DAY_KING', 'Rei do Leg Day', 'Complete 5 treinos de perna.', 500, '{"type": "count", "activity_type": "strength", "keyword": "leg", "target": 5}'),
('WEEKEND_WARRIOR', 'Guerreiro de Fim de Semana', 'Queime mais de 1000 calorias no fim de semana.', 300, '{"type": "calories", "days": ["Saturday", "Sunday"], "target": 1000}'),
('DATA_MARATHON', 'Maratonista de Dados', 'Conecte 3 apps externos.', 1000, '{"type": "connection", "target": 3}'),
('STREAK_7', 'Consistência de Ferro', 'Mantenha uma ofensiva de 7 dias.', 700, '{"type": "streak", "target": 7}');
