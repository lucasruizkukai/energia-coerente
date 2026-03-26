# Energia Coerente V2

## Objetivo

Evoluir o sistema de uma ficha unica por cliente para uma arquitetura orientada a:

- cliente
- atendimento
- metodo
- protocolo
- ferramentas do metodo

Isso permite usar o TGR como primeiro metodo e adicionar outros no futuro sem reescrever a base.

## Navegacao proposta

- Dashboard
- Clientes
- Atendimentos
- Metodos
- Devolutivas
- Financeiro

### Metodos

Cada metodo abre sua propria estrutura interna.

Exemplo inicial:

- TGR

### TGR

- Visao geral
- Protocolos
- Biometros
- Graficos
- Fichas
- Referencias

## Modelo mental

- `cliente`: a pessoa atendida
- `atendimento`: um processo terapeutico daquela pessoa
- `metodo`: o sistema utilizado no atendimento
- `protocolo`: a trilha principal dentro de um metodo
- `ferramenta`: biometro, grafico, ficha ou referencia usada dentro do metodo
- `registro`: resultado pratico do uso dessas ferramentas no atendimento

## Entidades principais

### 1. clients

Cadastro permanente da pessoa.

Campos principais:

- `id`
- `nome`
- `whatsapp`
- `email`
- `cidade`
- `data_nascimento`
- `observacoes_gerais`
- `created_at`
- `updated_at`

### 2. methods

Catalogo dos metodos terapeuticos.

Campos principais:

- `id`
- `slug`
- `nome`
- `descricao`
- `ativo`
- `ordem`

Exemplos:

- `tgr`
- outros metodos futuros

### 3. method_sections

Categorias internas do metodo.

Campos principais:

- `id`
- `method_id`
- `slug`
- `nome`
- `tipo`
- `ordem`

Exemplo para TGR:

- `protocolos`
- `biometros`
- `graficos`
- `fichas`
- `referencias`

### 4. method_items

Itens concretos dentro de cada secao do metodo.

Campos principais:

- `id`
- `method_id`
- `section_id`
- `slug`
- `nome`
- `descricao`
- `item_type`
- `ativo`
- `ordem`
- `metadata`

Exemplos TGR:

- `despertar`
- `harmonia`
- `vitalidade`
- `relacoes`
- `biometro-de-tempo`
- `grafico-de-chakras`

`metadata` guarda detalhes especificos do item sem quebrar o schema:

- etapas
- campos sugeridos
- escalas
- relacoes com outros itens

### 5. method_item_links

Relacao entre itens do metodo.

Serve para ligar:

- protocolo -> biometro
- protocolo -> grafico
- protocolo -> ficha
- protocolo -> referencia

Campos principais:

- `id`
- `source_item_id`
- `target_item_id`
- `link_type`
- `ordem`

Exemplos:

- `supports`
- `requires`
- `references`
- `recommended`

### 6. appointments

Unidade principal de trabalho.

Cada atendimento pertence a um cliente e escolhe um metodo.

Campos principais:

- `id`
- `client_id`
- `method_id`
- `titulo`
- `status`
- `data_inicio`
- `data_fim_prevista`
- `dia_processo`
- `queixa_principal`
- `objetivo`
- `valor`
- `status_pagamento`
- `observacoes`
- `created_at`
- `updated_at`

Observacao:

`tipo_sessao` deixa de ser o centro do sistema. O centro passa a ser o `metodo`.

### 7. appointment_protocols

Protocolos escolhidos dentro de um atendimento.

Permite que um atendimento use um protocolo principal e, se necessario, protocolos complementares.

Campos principais:

- `id`
- `appointment_id`
- `method_item_id`
- `is_primary`
- `status`
- `started_at`
- `completed_at`
- `notes`

### 8. appointment_tool_usages

Registro do uso de biometros, graficos, fichas e referencias durante o atendimento.

Campos principais:

- `id`
- `appointment_id`
- `method_item_id`
- `usage_type`
- `recorded_at`
- `summary`
- `result_data`
- `notes`

Exemplos de `usage_type`:

- `analysis`
- `support`
- `intervention`
- `reference`

`result_data` pode guardar JSON com:

- leitura
- percentual
- campo analisado
- tempo
- escala
- observacoes estruturadas

### 9. appointment_notes

Timeline livre do atendimento.

Campos principais:

- `id`
- `appointment_id`
- `note_type`
- `titulo`
- `conteudo`
- `created_at`

Exemplos:

- `diagnostico`
- `intervencao`
- `evolucao`
- `contato`
- `financeiro`

### 10. feedback_reports

Devolutiva final estruturada.

Campos principais:

- `id`
- `appointment_id`
- `resumo`
- `diagnostico_final`
- `padroes_identificados`
- `intervencoes_realizadas`
- `orientacoes_finais`
- `status`
- `delivered_at`

## Relacoes

- um `client` tem muitos `appointments`
- um `method` tem muitas `method_sections`
- um `method_section` tem muitos `method_items`
- um `appointment` pertence a um `client`
- um `appointment` pertence a um `method`
- um `appointment` pode ter muitos `appointment_protocols`
- um `appointment` pode ter muitos `appointment_tool_usages`
- um `appointment` pode ter muitas `appointment_notes`
- um `appointment` pode ter uma `feedback_report`

## Como o TGR entra

### method

- `TGR`

### sections

- `protocolos`
- `biometros`
- `graficos`
- `fichas`
- `referencias`

### exemplos de items

Protocolos:

- Despertar
- Vitalidade
- Harmonia
- Relacoes
- Limpeza e Protecao
- Prosperidade
- Psicoemocionais
- Chakras

Biometros:

- Biometro Numerico
- Biometro de Tempo
- Vitalidade
- Limpeza
- Protecao
- Chakras
- Relacionamento Campo Mental
- Relacionamento Campo Emocional

Graficos:

- os graficos ligados a cada protocolo

Fichas:

- ficha geral
- fichas por protocolo

Referencias:

- apostilas
- protocolos
- materiais auxiliares

## Recomendacao de implementacao

### Fase 1

Criar a base estrutural:

- `methods`
- `method_sections`
- `method_items`
- `method_item_links`
- `appointments`
- `appointment_protocols`
- `appointment_tool_usages`
- `appointment_notes`
- `feedback_reports`

### Fase 2

Cadastrar o TGR como primeiro metodo.

### Fase 3

Reescrever o dashboard para navegar por:

- clientes
- atendimentos
- metodos

### Fase 4

Modelar os protocolos TGR reais a partir dos PDFs.
