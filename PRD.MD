# Product Description
Growth OS é um SaaS de tomada de decisão de growth que unifica dados de aquisição, produto, CRM, receita e retenção numa visão AARRR. O produto ingere e normaliza fontes, detecta gargalos de funil, prevê impactos de mudanças e prioriza investimentos com recomendações acionáveis. O foco do MVP é fornecer diagnóstico automatizado, forecast de cenários e uma lista priorizada de ações com proprietários, reduzindo desperdício e acelerando time-to-value.

# Key features
1. Usuários devem poder autenticar-se e gerir organização/roles
2. Usuários devem poder conectar fontes e agendar ETL
3. Usuários devem poder mapear dados e validar qualidade
4. Usuários devem poder visualizar painel unificado AARRR
5. Usuários devem poder rodar diagnóstico automático de gargalos
6. Usuários devem poder simular forecasts e cenários
7. Usuários devem poder receber recomendações priorizadas acionáveis
8. Usuários devem poder colaborar, atribuir tarefas e receber alertas
9. Usuários devem poder gerir assinaturas e faturamento

# User Stories

## 1. Usuários devem poder autenticar-se e gerir organização/roles
- Como visitante, quero criar conta para acessar o workspace.
- Como admin, quero configurar SSO para segurança corporativa.
- Como owner, quero adicionar membros e definir roles para governança.
- Como usuário, quero recuperar senha para retomar acesso.

## 2. Usuários devem poder conectar fontes e agendar ETL
- Como admin, quero conectar GA, Ads e CRM para unificar dados.
- Como analista, quero agendar sincronizações automáticas para dados atualizados.
- Como admin, quero ver status de conexão para troubleshooting.

## 3. Usuários devem poder mapear dados e validar qualidade
- Como analista, quero mapear eventos ao esquema AARRR para consistência.
- Como analista, quero definir transformações simples para normalizar atributos.
- Como analista, quero rodar checks de qualidade para detectar gaps.

## 4. Usuários devem poder visualizar painel unificado AARRR
- Como growth PM, quero ver métricas AARRR em único dashboard.
- Como executivo, quero visualizar KPIs agregados para tomada de decisão.
- Como analista, quero filtrar e fazer drill-down por cohort e canal.

## 5. Usuários devem poder rodar diagnóstico automático de gargalos
- Como growth PM, quero identificar estágios com queda significativa no funil.
- Como analista, quero receber causas prováveis (ex.: baixa ativação) com evidências.
- Como manager, quero priorização inicial de issues por impacto estimado.

## 6. Usuários devem poder simular forecasts e cenários
- Como growth PM, quero simular aumento de conversão para ver impacto em receita.
- Como diretor, quero comparar dois cenários de investimento para decisão.
- Como analista, quero salvar cenários para reuso e auditoria.

## 7. Usuários devem poder receber recomendações priorizadas acionáveis
- Como PM, quero lista priorizada de iniciativas com ROI estimado.
- Como PM, quero receber playbooks sugeridos por tipo de problema.
- Como PM, quero exportar tarefas para ferramenta de execução (ex.: Jira).

## 8. Usuários devem poder colaborar, atribuir tarefas e receber alertas
- Como usuário, quero comentar e mencionar colegas em insights.
- Como manager, quero atribuir proprietário e prazo para cada recomendação.
- Como usuário, quero alertas quando métricas críticas caírem.

## 9. Usuários devem poder gerir assinaturas e faturamento
- Como admin, quero ver plano atual e limites do contrato.
- Como admin, quero atualizar método de pagamento e ver faturas.

# User Journeys
(Happy path scenarios — cada história tem um cenário correspondente)

## 1. Usuários devem poder autenticar-se e gerir organização/roles

### Como visitante, quero criar conta para acessar o workspace.
GIVEN a visitor is on signup page  
WHEN they submit valid email, password and company name  
THEN an account is created AND user is redirected to empty workspace

### Como admin, quero configurar SSO para segurança corporativa.
GIVEN an org owner is on Security settings  
AND identity provider details are available  
WHEN they enable SSO and save configuration  
THEN SSO is activated AND members must use SSO to login

### Como owner, quero adicionar membros e definir roles para governança.
GIVEN an owner is in Team settings  
WHEN they invite a user email and assign role Editor  
THEN invite is sent AND user appears as pending until acceptance

### Como usuário, quero recuperar senha para retomar acesso.
GIVEN a user is on login page  
WHEN they click "Forgot password" and submit email  
THEN recovery email is sent AND user can reset password via link

## 2. Usuários devem poder conectar fontes e agendar ETL

### Como admin, quero conectar GA, Ads e CRM para unificar dados.
GIVEN admin is on Connectors page  
WHEN they click "Add connector", authenticate GA and CRM  
THEN connectors are created AND initial sync starts

### Como analista, quero agendar sincronizações automáticas para dados atualizados.
GIVEN a connector exists with successful initial sync  
WHEN the analyst sets schedule to hourly and saves  
THEN connector sync runs hourly AND next run is scheduled

### Como admin, quero ver status de conexão para troubleshooting.
GIVEN a connector failed in last run  
WHEN admin opens connector details  
THEN last run status, error message and retry button are shown

## 3. Usuários devem poder mapear dados e validar qualidade

### Como analista, quero mapear eventos ao esquema AARRR para consistência.
GIVEN raw event schema is available  
WHEN analyst maps "signup_complete" to Activation  
THEN mapping is saved AND appears in metrics calculation

### Como analista, quero definir transformações simples para normalizar atributos.
GIVEN incoming property "utm_src" inconsistent  
WHEN analyst defines transformation to lowercase and trim  
THEN transformed values are used in reports

### Como analista, quero rodar checks de qualidade para detectar gaps.
GIVEN mappings exist  
WHEN analyst runs Data Quality check  
THEN report shows missing events, null rates and warnings

## 4. Usuários devem poder visualizar painel unificado AARRR

### Como growth PM, quero ver métricas AARRR em único dashboard.
GIVEN data is ingested and mappings applied  
WHEN PM opens AARRR dashboard  
THEN Acquisition, Activation, Retention, Referral, Revenue metrics display

### Como executivo, quero visualizar KPIs agregados para tomada de decisão.
GIVEN dashboard shows KPIs  
WHEN exec selects "Executive view"  
THEN high-level KPIs and trend sparkline are shown

### Como analista, quero filtrar e fazer drill-down por cohort e canal.
GIVEN dashboard loaded  
WHEN analyst filters by channel=Paid and cohort=last30d  
THEN metrics refresh and detailed cohort table appears

## 5. Usuários devem poder rodar diagnóstico automático de gargalos

### Como growth PM, quero identificar estágios com queda significativa no funil.
GIVEN dashboard data for last 30 days  
WHEN PM clicks "Diagnose funnel"  
THEN system highlights stage(s) with statistically significant drop

### Como analista, quero receber causas prováveis (ex.: baixa ativação) com evidências.
GIVEN a bottleneck is detected  
WHEN analyst views diagnosis detail  
THEN system lists probable causes with supporting metrics and examples

### Como manager, quero priorização inicial de issues por impacto estimado.
GIVEN multiple issues detected  
WHEN manager opens Priorities panel  
THEN issues are ranked by estimated revenue impact and confidence score

## 6. Usuários devem poder simular forecasts e cenários

### Como growth PM, quero simular aumento de conversão para ver impacto em receita.
GIVEN baseline metrics loaded  
WHEN PM sets conversion uplift +10% for Activation and runs scenario  
THEN projected revenue and ARR delta display with timeframe

### Como diretor, quero comparar dois cenários de investimento para decisão.
GIVEN two saved scenarios exist  
WHEN director selects both and clicks "Compare"  
THEN side-by-side forecasts with key deltas are shown

### Como analista, quero salvar cenários para reuso e auditoria.
GIVEN a scenario is configured  
WHEN analyst clicks "Save scenario" with name  
THEN scenario is stored AND appears in scenario library

## 7. Usuários devem poder receber recomendações priorizadas acionáveis

### Como PM, quero lista priorizada de iniciativas com ROI estimado.
GIVEN diagnostics and forecasts completed  
WHEN PM opens Recommendations tab  
THEN prioritized initiatives with estimated ROI, effort and owner suggested are listed

### Como PM, quero receber playbooks sugeridos por tipo de problema.
GIVEN an issue classified as "Activation drop"  
WHEN PM views recommendation detail  
THEN a relevant playbook with step-by-step actions is shown

### Como PM, quero exportar tarefas para ferramenta de execução (ex.: Jira).
GIVEN a recommendation selected  
WHEN PM clicks "Export to Jira" and confirms project  
THEN a Jira ticket is created with description and links back to insight

## 8. Usuários devem poder colaborar, atribuir tarefas e receber alertas

### Como usuário, quero comentar e mencionar colegas em insights.
GIVEN an insight is open  
WHEN user adds comment and mentions @colleague  
THEN @colleague receives notification AND comment is saved

### Como manager, quero atribuir proprietário e prazo para cada recomendação.
GIVEN a recommendation exists  
WHEN manager assigns owner Alice and due date  
THEN recommendation shows owner, date and status "Assigned"

### Como usuário, quero alertas quando métricas críticas caírem.
GIVEN threshold alert configured for churn > X  
WHEN churn exceeds threshold on daily check  
THEN an alert email and in-app notification are sent to subscribers

## 9. Usuários devem poder gerir assinaturas e faturamento

### Como admin, quero ver plano atual e limites do contrato.
GIVEN admin is on Billing page  
WHEN they open Plan details  
THEN current plan, user limits and usage metrics display

### Como admin, quero atualizar método de pagamento e ver faturas.
GIVEN admin is on Billing page  
WHEN they add new card and view invoices  
THEN payment method updates AND PDF invoices are downloadable


