# TGR - Protocolo Relacoes

## Papel do protocolo

O protocolo `Relacoes` deve investigar vinculos, interferencias e padroes relacionais, com leitura mais profunda dos campos:

- mental
- emocional
- tipo de vinculo

Esse protocolo precisa servir tanto para:

- relacionamento amoroso
- relacoes familiares
- relacoes profissionais
- vinculos de convivencia

## Estrutura da tela

### 1. Cabecalho do protocolo

Campos:

- `nome_protocolo`: fixo `Relacoes`
- `tipo_relacao`
- `pessoa_vinculada`
- `objetivo_da_leitura`
- `observacao_inicial`

Valores sugeridos para `tipo_relacao`:

- amorosa
- familiar
- profissional
- amizade
- convivio
- outro

### 2. Bloco principal de leitura

Campos:

- `campo_mental_resultado`
- `campo_emocional_resultado`
- `tipo_vinculo_resultado`
- `interferencias_identificadas`
- `padrao_relacional`
- `nivel_de_harmonia_relacional`
- `conclusao_analitica`

### 3. Bloco transversal de chakras

Obrigatorio em `Relacoes`.

Campos:

- `chakras_em_harmonia`
- `chakras_em_desequilibrio`
- `leitura_chakras`
- `observacoes_chakras`

### 4. Biometros relacionados

Biometros-base esperados:

- `Relacionamento - Campo Mental`
- `Relacionamento - Campo Emocional`
- `Tipo de Vinculo`
- `Biometro Numerico`
- `Biometro de Tempo` quando houver leitura temporal

### 5. Graficos relacionados

Campos:

- `graficos_utilizados`
- `leitura_dos_graficos`
- `sintese_graficos`

### 6. Conduta e encaminhamento

Campos:

- `intervencao_indicada`
- `orientacao_terapeutica`
- `foco_dos_proximos_dias`
- `observacoes_finais_do_protocolo`

## Estrutura de dados recomendada

Esse protocolo deve salvar um objeto de leitura como este:

```json
{
  "tipo_relacao": "",
  "pessoa_vinculada": "",
  "objetivo_da_leitura": "",
  "campo_mental_resultado": "",
  "campo_emocional_resultado": "",
  "tipo_vinculo_resultado": "",
  "interferencias_identificadas": "",
  "padrao_relacional": "",
  "nivel_de_harmonia_relacional": "",
  "chakras_em_harmonia": [],
  "chakras_em_desequilibrio": [],
  "leitura_chakras": "",
  "observacoes_chakras": "",
  "graficos_utilizados": [],
  "leitura_dos_graficos": "",
  "sintese_graficos": "",
  "intervencao_indicada": "",
  "orientacao_terapeutica": "",
  "foco_dos_proximos_dias": "",
  "observacoes_finais_do_protocolo": "",
  "conclusao_analitica": ""
}
```

## Como isso entra no atendimento

No atendimento da cliente:

- o metodo fica `TGR`
- o protocolo principal pode ser `Relacoes`
- os biometros usados entram como registros vinculados
- os graficos usados entram como registros vinculados
- a leitura final alimenta a devolutiva

## Seções recomendadas no app

Dentro de `Metodos > TGR > Protocolos > Relacoes`:

- `Resumo`
- `Campos de leitura`
- `Chakras`
- `Biometros relacionados`
- `Graficos relacionados`
- `Aplicacao no atendimento`

Dentro do `Atendimento` quando o protocolo for `Relacoes`:

- `Resumo`
- `Leitura relacional`
- `Chakras`
- `Ferramentas usadas`
- `Intervencao`
- `Devolutiva`

## Proxima etapa

Transformar esse protocolo em:

- schema de campos no app
- secao visual dentro do dashboard
- estrutura persistente para registros reais
