-- 1. Habilitar a extensão pgcrypto para geração automática de UUIDs
create extension if not exists "pgcrypto";

--------------------------------------------------------------------------------
-- 2. Tabela: PROFILES (Perfis de Usuários)
-- Finalidade: Espelha dados não-sensíveis do auth.users do Supabase Auth de forma segura
--------------------------------------------------------------------------------
create table public.profiles (
    id uuid references auth.users on delete cascade not null,
    email text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    
    primary key (id)
);

--------------------------------------------------------------------------------
-- 3. Tabela: USER_SETTINGS (Configurações e Preferências)
-- Relacionamento: 1:1 com Profiles
--------------------------------------------------------------------------------
create table public.user_settings (
    user_id uuid references public.profiles(id) on delete cascade not null,
    active_lawyer_name text default 'Dr. Advogado' not null,
    lawyer_spec text default 'geral' not null,
    auto_analysis boolean default true not null,
    language text default 'pt-BR' not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    
    primary key (user_id)
);

--------------------------------------------------------------------------------
-- 4. Tabela: PROCESSES (Processos Judiciais)
-- Relacionamento: 1:N com Profiles (Isolado por usuário)
--------------------------------------------------------------------------------
create table public.processes (
    id uuid default gen_random_uuid() not null,
    user_id uuid references public.profiles(id) on delete cascade not null,
    title text not null,
    case_number text default 'Em confecção de Protocolo' not null,
    category text not null,
    description text not null,
    status text default 'preliminary' not null,
    client_notes text,
    ai_analysis text,
    updated_date text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    
    primary key (id)
);

-- Índices de Performance para pesquisas rápidas baseadas no dono do registro e status
create index idx_processes_user_id on public.processes(user_id);
create index idx_processes_status on public.processes(status);

--------------------------------------------------------------------------------
-- 5. Tabela: CONSULTATIONS (Agenda de Consultas)
-- Relacionamento: 1:N com Profiles (Isolado por usuário)
--------------------------------------------------------------------------------
create table public.consultations (
    id uuid default gen_random_uuid() not null,
    user_id uuid references public.profiles(id) on delete cascade not null,
    client_name text not null,
    area text not null,
    date date not null,
    time time not null,
    issue text not null,
    status text default 'scheduled' not null,
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    
    primary key (id)
);

create index idx_consultations_user_id on public.consultations(user_id);
create index idx_consultations_date_time on public.consultations(date, time);

--------------------------------------------------------------------------------
-- 6. Tabela: CHAT_HISTORY (Histórico de Conversas da IA)
-- Relacionamento: 1:N com Profiles (Isolado por usuário)
--------------------------------------------------------------------------------
create table public.chat_history (
    id uuid default gen_random_uuid() not null,
    user_id uuid references public.profiles(id) on delete cascade not null,
    role text not null constraint chk_chat_role check (role in ('user', 'assistant')),
    content text not null,
    timestamp timestamp with time zone default timezone('utc'::text, now()) not null,
    
    primary key (id)
);

create index idx_chat_history_user_id on public.chat_history(user_id);
create index idx_chat_history_timestamp on public.chat_history(timestamp desc);

--------------------------------------------------------------------------------
-- 7. Automação do Banco: Triggers PostgreSQL para Profiles
-- Função para sincronizar a tabela pública com o cadastro interno do auth
--------------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
security definer
set search_path = public
language plpgsql
as $$
begin
    -- Insere o perfil
    insert into public.profiles (id, email)
    values (new.id, new.email);

    -- Insere as configurações padrão vinculadas
    insert into public.user_settings (user_id)
    values (new.id);

    return new;
end;
$$;

-- Vincular gatilho ao cadastro do Supabase Auth
create or replace trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

--------------------------------------------------------------------------------
-- 8. Segurança e Row Level Security (RLS)
--------------------------------------------------------------------------------
-- Habilitar RLS nas tabelas operacionais
alter table public.profiles enable row level security;
alter table public.user_settings enable row level security;
alter table public.processes enable row level security;
alter table public.consultations enable row level security;
alter table public.chat_history enable row level security;

-- Políticas de RLS: PROFILES
create policy "Usuários podem ver seu próprio perfil" on public.profiles
    for select to authenticated using ((select auth.uid()) = id);

-- Políticas de RLS: USER_SETTINGS
create policy "Usuários podem ver suas próprias configurações" on public.user_settings
    for select to authenticated using ((select auth.uid()) = user_id);

create policy "Usuários podem alterar suas próprias configurações" on public.user_settings
    for update to authenticated using ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);

-- Políticas de RLS: PROCESSES
create policy "Usuários podem ler seus processos" on public.processes
    for select to authenticated using ((select auth.uid()) = user_id);

create policy "Usuários podem cadastrar processos" on public.processes
    for insert to authenticated with check ((select auth.uid()) = user_id);

create policy "Usuários podem atualizar seus processos" on public.processes
    for update to authenticated using ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);

create policy "Usuários podem excluir seus processos" on public.processes
    for delete to authenticated using ((select auth.uid()) = user_id);

-- Políticas de RLS: CONSULTATIONS
create policy "Usuários podem ler suas consultas" on public.consultations
    for select to authenticated using ((select auth.uid()) = user_id);

create policy "Usuários podem agendar consultas" on public.consultations
    for insert to authenticated with check ((select auth.uid()) = user_id);

create policy "Usuários podem atualizar suas consultas" on public.consultations
    for update to authenticated using ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);

create policy "Usuários podem excluir suas consultas" on public.consultations
    for delete to authenticated using ((select auth.uid()) = user_id);

-- Políticas de RLS: CHAT_HISTORY
create policy "Usuários podem ler seu histórico de chat" on public.chat_history
    for select to authenticated using ((select auth.uid()) = user_id);

create policy "Usuários podem registrar mensagens no chat" on public.chat_history
    for insert to authenticated with check ((select auth.uid()) = user_id);

create policy "Usuários podem limpar suas mensagens de chat" on public.chat_history
    for delete to authenticated using ((select auth.uid()) = user_id);
