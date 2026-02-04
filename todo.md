# Data Analyzer Pro - TODO

## Funcionalidades Principais

- [x] Carregamento de ficheiros CSV e Excel com validação de formato e tamanho
- [ ] Visualização de dados em tabela interativa com paginação e ordenação
- [x] Estatísticas descritivas automáticas (média, mediana, desvio padrão, mínimo, máximo)
- [ ] Gráficos interativos (linha, barra, dispersão, pizza) usando Recharts
- [x] Filtros dinâmicos por colunas e valores para análise focada
- [x] Exportação de resultados de análise em formato CSV ou JSON
- [x] Histórico de ficheiros carregados com metadados (nome, data, tamanho)
- [ ] Painel de controlo com resumo de análises recentes e estatísticas rápidas
- [ ] Gerar insights automáticos com IA (deteção de padrões, anomalias, sugestões)
- [ ] Enviar alertas automáticos ao proprietário quando análises são concluídas

## Design e Estética

- [x] Definir paleta de cores elegante e profissional
- [x] Implementar layout responsivo com DashboardLayout
- [x] Criar componentes UI consistentes com shadcn/ui
- [x] Aplicar tipografia e espaçamento profissional
- [ ] Adicionar transições e micro-interações suaves

## Base de Dados

- [x] Criar schema para ficheiros carregados
- [x] Criar schema para análises e resultados
- [x] Criar schema para histórico de operações
- [x] Implementar migrations SQL

## Backend (tRPC)

- [x] Procedimento para upload de ficheiros
- [x] Procedimento para processamento de dados
- [x] Procedimento para cálculo de estatísticas
- [ ] Procedimento para geração de insights com IA
- [x] Procedimento para deteção de anomalias
- [x] Procedimento para exportação de dados
- [x] Procedimento para listagem de histórico

## Frontend

- [x] Página de upload com drag-and-drop
- [ ] Visualizador de tabela de dados
- [ ] Painel de estatísticas descritivas
- [ ] Galeria de gráficos interativos
- [ ] Painel de filtros dinâmicos
- [ ] Painel de controlo com resumo
- [ ] Histórico de ficheiros
- [ ] Visualizador de insights

## Testes

- [x] Testes de upload de ficheiros
- [x] Testes de processamento de dados
- [x] Testes de cálculo de estatísticas
- [ ] Testes de geração de insights
- [ ] Testes de exportação


## Bugs Encontrados e Corrigidos

- [x] Validação de ficheiros CSV rejeitando ficheiros válidos por tipo MIME incorreto
- [x] Melhorar detecção de tipo de ficheiro baseada em extensão e conteúdo
- [x] Erro "Buffer not defined" ao fazer upload de ficheiros no cliente

## Funcionalidades em Desenvolvimento

- [x] Implementar visualizador de tabela de dados com paginação
- [x] Implementar painel de estatísticas descritivas
- [x] Implementar gráficos interativos com Recharts
- [x] Implementar estado compartilhado entre abas (ficheiro selecionado)
- [x] Contexto de ficheiro selecionado não persiste após upload para outras abas
