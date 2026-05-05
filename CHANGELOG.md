# Changelog

## [2.7.0] - 2026-05-05

### Adicionado / Melhorado
- **Aperfeiçoamento do Repasse Drill-down (Infra-BR):**
  - Implementado o detalhamento em três níveis de profundidade no card de desempenho do Infra-BR: **Dimensões > Componentes > Indicadores**.
  - **Tooltips Contextuais:** Integrados os novos tooltips em pop-up utilizando a biblioteca Radix UI para otimizar o espaço e apresentar dados secundários de forma interativa.
  - O painel iterativo dos indicadores agora exibe diretamente na tela as descrições/cálculos, unidade de medida e a interpretação correspondente de cada indicador.

## [2.6.0] - 2026-05-05

### Preparações
- Versão e documento de log atualizados em preparação para novos ajustes e evoluções na interface e nos dados do aplicativo.

## [2.5.3] - 2026-05-05

### Adicionado / Melhorado
- **Aperfeiçoamento do Tooltip no Mapa Coroplético (Alinhamento e Bordas):**
  - O tooltip do mapa na aba de Avaliação Infra-BR foi alinhado à esquerda para melhorar a comparabilidade visual.
  - Removidos os contornos em formato de botão das pílulas para uma leitura contínua, usando separadores discretos, padronizando visualmente com o componente "Investimento por Estado".

## [2.5.2] - 2026-05-05

### Adicionado / Melhorado
- **Aperfeiçoamento do Tooltip no Mapa Coroplético (Fundo Escuro):**
  - O tooltip do mapa na aba de Avaliação Infra-BR foi revertido para o padrão de fundo escuro, garantindo consistência com os outros painéis do aplicativo.
  - As pílulas descritivas ("Fomento (Atual/2026)", etc.) foram mantidas com suas cores distintas para facilitar a identificação visual rápida, enquanto o texto foi ajustado para leitura no modo escuro.

## [2.5.1] - 2026-05-05

### Adicionado / Melhorado
- **Aperfeiçoamento do Tooltip no Mapa Coroplético:**
  - O tooltip do mapa na aba de Avaliação Infra-BR agora adota padrão claro para melhor visibilidade com cores institucionais do CONFEA.
  - Implementada a divisão mais detalhada dos repasses distinguindo os montantes de "Fomento (Atual/2026)", "Fomento (Histórico/2025)" e "Patrocínio (Histórico/2025)", espelhando as pílulas com as cores primárias já definidas em outras áreas do app.

## [2.5.0] - 2026-05-05

### Adicionado / Melhorado
- **Novo Mapa Coroplético (Infra-BR):**
  - Implementado gráfico de mapa do Brasil exibindo a distribuição geográfica da **Nota Infra-BR**, com a intensidade da cor diretamente associada à nota do estado.
  - O mapa serve como um selecionador interativo: ao clicar no estado correspondente, todos os indicadores e componentes da tela passarão a se referenciar a este estado.
  - Inserção de tooltip customizado contendo valores de **Nota**, **Rank Infra-BR**, **Total Repassado**, e subdivisões por **Fomento** e **Patrocínio**.

## [2.4.2] - 2026-05-05

### Adicionado / Melhorado
- **Nova Matriz de Quadrantes (Infra-BR x Repasse Financeiro):**
  - Criação de um novo gráfico de dispersão com linhas de referência indicando a média nacional de cada eixo (Nota Infra-BR e Volume de Repasse).
  - O gráfico permite a divisão clara dos estados em quadrantes para diagnóstico rápido (exemplo: "Alto Repasse / Alta Infra" vs "Baixo Repasse / Baixa Infra").
  - O gráfico de dimensões original (tamanho da bolha) foi mantido ao lado para rápida comparação.

## [2.4.1] - 2026-05-05

### Adicionado / Melhorado
- **Aperfeiçoamento do Gráfico de Dispersão (Avaliação Infra-BR):**
  - Implementada a variação dinâmica de tamanho dos círculos. O raio de cada ponto agora reflete o binômio do volume de repasses financeiro e respectiva posição no ranking Infra-BR (estados com elevado volume de repasse e ótima infraestrutura recebem maior destaque visual).

## [2.4.0] - 2026-05-05

### Adicionado / Melhorado
- **Nova aba "Avaliação Infra-BR":** 
  - Gráfico de dispersão relacionando a **Nota Infra-BR** com o **Volume Total de Repasse** por Unidade Federativa.
  - Gráfico em radar (Radar Chart) indicando a comparação das **dimensões** de cada estado em contraste com a **Média Nacional**.
  - Detalhamento progressivo através da seleção de estado constando os **Componentes e Indicadores** das dimensões de mobilidade, energia, água, etc.

## [2.3.1] - 2026-05-04

### Adicionado / Melhorado
- **Tabela EC Geral - Indicadores Visuais de CNPJ e Vínculo:**
  - Aplicação de cores dinâmicas aos CNPJs identificados para exibir de maneira clara a qual projeto base (Fomento 2025, Fomento 2026, Patrocínio 2025, CDEN ou Precursoras) ele pertence.
  - O formato apresentado permite cruzar imediatamente entidades que possuem mais de um CNPJ diferente no cruzamento das bases (Divergência de CNPJ).

## [2.3.0] - 2026-05-04

### Adicionado / Melhorado
- **Tabela EC Geral Aprimorada:**
  - Inclusão e validação cruzada dos dados de todos os editais disponíveis (Fomento 2025/2026, Patrocínio, CDEN e Precursoras).
  - Novas colunas exibidas: CNPJ, status de entidade do CDEN e status de entidade Precursora, alimentadas a partir do cruzamento dos dados.
  - Inclusão da coluna de "Observações" visando evidenciar inconsistências cadastrais, como duplicidade de entidades no próprio EC Geral, ou divergência do CNPJ entre os demais arquivos.
  - Filtros criados para permitir a rápida navegação entre entidades CDEN e Precursoras no Diretório de Entidades do EC Geral.

## [2.2.2] - 2026-05-04

### Adicionado / Melhorado
- **Aprimoramento do Tooltip Geográfico (Repasse Total Histórico):**
  - Aplicada a mesma estrutura detalhada do *tooltip* (incluindo posição de repasse, posição Infra-BR, estado, região, entidades, fomento e patrocínio) e formatação de cores desenvolvida para as abas correntes no mapa "Repasse Total Histórico" da aba "Histórico - Entidades (2025)".

## [2.2.1] - 2026-05-04

### Adicionado / Melhorado
- **Aprimoramento do Tooltip Geográfico (Visão Geral Corrente):**
  - Ajustado o *tooltip* do mapa da aba "Visão Geral Corrente" para exibir os dados de total de entidades atendidas, fomento e patrocínio, padronizando sua apresentação e incorporando as cores pré-definidas.

## [2.2.0] - 2026-05-04

### Adicionado / Melhorado
- **Aprimoramento do Tooltip Geográfico (Visão Geral Corrente e Histórico):**
  - **Ranking de Repasse:** Adicionado o destaque da posição exata do estado em relação ao volume de repasse.
  - **Ranking Infra-BR:** Incorporado de forma complementar no painel a exibição simultânea da respectiva posição do estado de acordo com o índice de infraestrutura nacional (Infra-BR).
  - Estruturação em linhas distintas e organizadas dentro do *tooltip*, ampliando a clareza e análise rápida para o gestor.

## [2.1.0] - 2026-05-04

### Adicionado / Melhorado
- **Aba EC Geral:** Aperfeiçoamento da seção destinada à listagem e consulta avançada do Diretório de Entidades de Classe globais.
- **Identificação Visual de Repasses:** Inclusão de uma nova coluna estrutural que aponta visivelmente, através de ícones estelares em cores padronizadas, se a entidade de classe assinalada foi apoiada integralmente por recursos advindos de Fomento, Patrocínio, ou de Ambos, em todos os seus registros históricos.
- **Filtro Direcionado de Repasses:** Adoção de uma nova estrutura analítica de filtros de Repasse nas listagens de EC Geral que suporta recortes exatos pelas tags de apoio: Todos, Fomento, Patrocínio, Ambos e Nenhum.
- **Cards Analíticos Dinâmicos:** Consolidação de três novos cartões estruturados posicionados no topo da visualização da aba da EC Geral; O primeiro reportando o total inalterável da malha global, enquanto os outros dois respondem individualmente aos filtros aplicados, mostrando com clareza matemática a densidade bruta da filtragem e o enquadramento percentual de repasses frente ao todo.

### Corrigido
- **Padronização Inter-relacional de Nomenclaturas:** Múltiplas correções artesanais e manuais de identificação executadas no corpo de banco de dados nativo (\`ECGeral.ts\`) mitigando disparidades textuais ou grafias irregulares entre a matriz base e suas dependências regionais operantes, sobretudo em unidades contendo a palavra-chave "ABENC" alocadas em variados estados atuantes no cadastro.

## [2.0.0] - 2026-04-30

### Adicionado / Melhorado
- **Geração de Gráficos Sob Demanda:** A visualização de dados via IA agora ocorre estritamente por solicitação explícita do usuário na Área de Consulta, evitando poluição visual com gráficos não solicitados, e apresentando relatórios mais limpos por padrão.
- **Identificação Visual de Desenvolvimento:** Adicionado um *ribbon* (marcador diagonal vermelho) no canto superior direito do painel informando "Em Desenvolvimento", visando mitigar interpretações de usuários finais quanto ao status dos dados e maturidade da aplicação na versão atual.
- **Refinamento do Menu Lateral:** Ajuste no espaçamento e tamanho tipográfico da árvore de links no menu lateral esquerdo da aplicação, otimizando o preenchimento em tela e eliminando o surgimento da barra de rolagem vertical não desejada.

## [1.11.1] - 2026-04-30

### Corrigido
- **Falha de Renderização de Gráficos na IA:** Ajuste rigoroso no modelo da IA e no interceptador Markdown (`ChartRenderer`). A IA ocasionalmente enviava o JSON do gráfico com formatação de comentários suportada por Javascript, mas que quebrava o parse JSON, ou falhava na injeção correta da tag markdown de "codeblock". O prompt interno do sistema foi reescrito para reforçar formato JSON estrito, além de aprimorar a tolerância a falhas na leitura JSON no front-end para evitar a saída visual de código cru.

## [1.11.0] - 2026-04-30

### Adicionado / Melhorado
- **Gráficos Dinâmicos com IA (Zero Custo):** A IA agora analisa os dados estruturados de fomento e patrocínio e, se for útil para a visualização, é capaz de retornar uma estruturta declarativa JSON diretamente na resposta markdown usando a linguagem customizada `json-chart`. O frontend intercepta via react-markdown e renderiza automaticamente gráficos reais interativos (BarChart, LineChart e PieChart) com a biblioteca `recharts`, mantendo toda a execução no lado do cliente com dados contextuais locais sem consumir nenhuma API paga externa para geração de imagens. Estrutura sem custos mantida com sucesso!

## [1.10.1] - 2026-04-30

### Corrigido
- **Correção Geral no Endpoint de IA (`/api/chat`):** Resolvido o erro crítico de dependência (`Cannot find module 'pdf-parse'`) que ocorria durante a consulta em ambientes de produção e nuvem, que ocasionava falhas ao acionar a IA.
- **RAG Compilado (Build-time RAG):** Para sanar os problemas de resolução de dependências CJS no ambiente de build-deploy e limites de memória, a estratégia de leitura de PDFs e base de conhecimento foi convertida de "runtime" para "build-time". Todos os documentos oficiais (Editais, Portarias, Decisões) agora são pré-compilados como dados nativos no projeto (`editais-context.ts`), garantindo máxima performance, tempo de resposta síncrono instantâneo e redução drástica do tempo de boot e consumo da cloud sem perder dados das normativas.

## [1.10.0] - 2026-04-30

### Adicionado / Melhorado
- **Integração de Base de Conhecimento Legada (PDFs):** Ingestão e processamento de editais, portarias, normativas e leis no Assistente de IA de forma autônoma (via \`pdf-parse\`).
- **Contexto Avançado (RAG Simplificado):** O assistente virtual agora consome os textos completos dos regulamentos oficiais, resultando em respostas significativamente mais precisas, embasadas e aderentes às bases jurídicas dos programas de Fomento e Patrocínio e Licitações & Contratos.
- Nova versão principal ("minor bump") marcando um progresso substancial na arquitetura de IA embutida na plataforma, agora munida de documentação proprietária contextual para análise técnica.

## [1.9.1] - 2026-04-30

### Adicionado / Melhorado
- **Aprimoramento do Tooltip Geográfico ("Visão Geral Corrente" e "Histórico"):**
  - **Ranking de Estados:** Adicionada a classificação do estado em relação ao total de repasse ao lado do nome e sigla no tooltip (ex: São Paulo (SP) (1º)).
  - **Proporcionalidade Geográfica:** Inclusão explícita da proporção percentual que o repasse do estado representa em relação ao montante global da análise.
  - O mesmo foi feito para a linha contendo os valores da região.

## [1.9.0] - 2026-04-30

### Adicionado / Melhorado
- **Reorganização Estrutural de Gráficos:** O gráfico de "Evolução de Orçamento" (comparativo de repasses entre 2025 e 2026) foi migrado da aba de "Insights e Análises" para a aba principal de "Histórico".
- O gráfico agora se encontra estrategicamente posicionado como um resumo executivo logo abaixo dos indicadores (KPI) de "Total de Repasse" e "Entidades Selecionadas", ocupando um terço de sua altura original para atuar como um panorama visual sutil e eficiente no contexto de histórico.

## [1.8.1] - 2026-04-30

### Adicionado / Melhorado
- **Identificação de Período nas Abas de Histórico:** Incluída a referência explicita ao ano "(2025)" ao título da aba principal de "Histórico" e em todas as suas subseções ("Fomento", "Patrocínio" e "Entidades"), prevendo a futura inclusão de dados de múltiplos anos.

## [1.8.0] - 2026-04-30

### Adicionado / Melhorado
- **Aprimoramento do Tooltip Geográfico (Histórico):** Incluídas as linhas específicas de "Fomento" e "Patrocínio" no mapa da aba Histórico, aplicando o mesmo padrão de cores e hierarquia consolidada na visualização global de entidades.
- **Padronização Visual de Tooltips:** Uniformidade visual dos painéis de informações (tooltips) sobrepostos nos gráficos das análises. Integrado o padrão visual escuro de alto contraste (estilo slate-900 / dark mode) globalmente em todos os gráficos de barras, linhas, dispersão e de rosca usando atributos de UI/UX personalizados.
- **Gráfico de "Distribuição por Grupo":** Realinhamento visual de dimensão. O gráfico de rosca que distingue grupos de atuação (CDEN, Precursoras, etc) foi redimensionado para adequar-se à importância relativa visual. Acrescidos ao tooltip os montantes monetários e a contagem explícita de "Entidades Atendidas" contemplando o cálculo da expressividade (porcentagens).
- **Indicadores de Mapas Topográficos:** O tooltip de regiões contendo estados nos mapas flutuantes foi remodelado em listagem estruturada ao invés de linhas embutidas, passando a discriminar separadamente: Valor do Estado, Valor da Região, e Total de Entidades, garantindo maior transparência e coesão das análises geográficas focadas em contexto multi-nível.

## [1.6.0] - 2026-04-29

### Adicionado / Melhorado
- **Segurança da API Refatorada (IA Assistente):** Reestruturação profunda na arquitetura do Assistente de Inteligência Artificial para garantir segurança no tráfego da API Key.
- **Integração Backend/Node.js:** A aplicação, originalmente executando um modelo Client-Side (SPA) puramente no navegador, foi promovida a arquitetura Full-Stack com servidor Node.js/Express (`server.ts`).
- **Endpoint Exclusivo de AI (`/api/chat`):** A comunicação com o SDK do Google GenAI migrou totalmente para o ambiente seguro do backend, impedindo que a VITE_GEMINI_API_KEY ou qualquer outra chave sensível seja exposta (via DevTools/Network) no navegador do usuário final.
- **Scripts de Build e Deploy Adaptados:** Atualização dos pacotes (`tsx`), adaptação no pipeline do Vite (Vite as Middleware), e configuração customizada do `package.json` + `vercel.json` para assegurar o funcionamento pleno tanto no ambiente de dev local/AI Studio (0.0.0.0, porta 3000) quanto no deploy contínuo em nuvem via Vercel.

## [1.5.0] - 2026-04-29

### Adicionado / Melhorado
- **Finalização do Assistente de IA:** Versão consolidada do Assistente de Inteligência Artificial para consulta de dados estruturados.
- **Renderização e Formatação Completas:** Adoção e estabilização de bibliotecas interpretadoras de Markdown (`react-markdown`, `remark-gfm`, `remark-math` e `rehype-katex`), conferindo estabilidade visual à formatação de listas, tabelas e cálculos matemáticos gerados pelas respotas do Gemini.
- **Isolamento de Domínio e Conduta:** Estabelecidos comandos restritos ao ecossistema do aplicativo (Fomento e Patrocínio), com tratamento de recusas e alertas educacionais.

## [1.4.2] - 2026-04-29

### Corrigido
- **Fórmulas Matemáticas na Resposta da IA:** Corrigido problema com a exibição de fórmulas matemáticas (como expressões do tipo `\frac{A}{B}`). Implementados os plugins `remark-math`, `rehype-katex` e `katex` para que o interpretador de Markdown converta corretamente expressões matemáticas avançadas na apresentação visual interativa da IA.

## [1.4.1] - 2026-04-29

### Corrigido
- **Tabelas na Resposta da IA:** Corrigido problema de formatação na qual as respostas estruturadas fornecidas pela inteligência artificial em formato tabular perdiam a quebra de linha. Implementado o plugin oficial \`remark-gfm\` no interpretador de Markdown juntamente com as bibliotecas nativas de tipografia do Tailwind, garantindo assim total suporte e aderência nativa a tabelas, listas e citações.

## [1.4.0] - 2026-04-29

### Adicionado / Melhorado
- **IA Assistente:** Implementado recurso de busca e análise inteligente guiado pelo assistente Gemini, usando o novo módulo "IA - Consulta de Dados" adicionado no menu.
- **Contexto Restritivo com Regras Estritas:** A inteligência artificial foi configurada de forma fechada, fornecendo respostas baseando-se única e exclusivamente no banco de dados estrutural do Fomento e Patrocínio (2025/2026). Conta também com mensagens explícitas atestando respeito a termos de conduta, declinando de questões estranhas ao escopo. O app agora tira proveito robusto do SDK `@google/genai` (uso interno gratuito no build do AI Studio sem custos para o usuário) garantindo a funcionalidade dentro das permissões e regulamentos.

## [1.3.0] - 2026-04-29

### Adicionado / Melhorado
- **Nova Aba "Força por Estado":** O novo painel dinâmico foi oficializado como uma sub-aba estrutural na listagem do aplicativo (após Insights e Análises), permitindo ampla expansão na escalabilidade visual desta representação particular.
- **Gráfico de Dispersão Consolidado:** O gráfico de dispersão com mapeamento cartográfico visual obteve correções e refinamentos finais. Foram aplicados os cálculos matemáticos adequados para redimensionamento proporcional fiel dos objetos, bem como o fluxo fidedigno das bandeiras de todos os estados brasileiros no plano do gráfico.

## [1.2.8] - 2026-04-29

### Corrigido
- **Imagens das Bandeiras (`StateForceView`):** Corrigida a renderização do fundo dos círculos de dados no gráfico para exibir as bandeiras correntes dos estados brasileiros. O serviço de CDN anterior (FlagCDN) não possuía suporte explícito à hierarquia de estados brasileiros, então o visualizador passou a extrair imagens consistentes de um repositório confiável no GitHub (`bgeneto/bandeiras-br`).

## [1.2.7] - 2026-04-29

### Corrigido
- **Ajuste no Dimensionamento (Dispersão de Força por Estado):** Implementado cálculo manual fidedigno para a visualização gráfica dos tamanhos das bandeiras dos estados. O raio em cada círculo agora corresponde de forma exata e proporcional (usando mapeamento de área relativa e raiz quadrada em relação ao montante máximo) ao valor total de repasses destinados a cada UF.

## [1.2.6] - 2026-04-29

### Adicionado / Melhorado
- **Para Evitar Poluição Visual:** O gráfico "Força por Estado" (dispersão de performance Fomento vs. Patrocínio por estado) foi promovido para uma aba individual própria chamada `Força por Estado`, posicionada logo após `Insights e Análises`.
- Com esta alteração, na aba mãe ("Insights e Análises"), os visualizadores "De Onde a Verba Vem?" ganham maior destaque, enquanto o gráfico de "Evolução de Orçamento" agora ocupa a largura total inferior da tela, entregando uma visualização com mais espaço dinâmico de plotagem.

## [1.2.5] - 2026-04-29

### Alterado
- **Dispersão de Força por Estado (`InsightsView`):** O gráfico anterior (em barras) que comparava o volume de Fomento vs Patrocínio dos estados foi substituído por um Gráfico de Dispersão (Scatter Chart).
- A nova visualização plota o repasse de Fomento (eixo X) contra Patrocínio (eixo Y), onde cada ponto representa um estado.
- Adicionada formatação visual personalizada aos pontos de dados: o tamanho de cada elemento no gráfico reflete de forma proporcional ao montante de apoio recebido, e a representação se dá pela imagem em formato redondo com a bandeira do estado (via integração com FlagCDN).

## [1.2.4] - 2026-04-29

### Adicionado / Melhorado
- **Funil de Força por Estado (`InsightsView`):** Adicionado um novo gráfico de barras horizontais sobrepostas (simulando um funil de concentração de verbas) que permite parear os montantes de Fomento e Patrocínio concomitantemente para cada estado.
- **Integração de Layout:** O novo gráfico de Força por Estado foi agrupado na mesma linha e alinhado em proporção 50/50 com o demonstrativo de "Evolução de Orçamento", logo abaixo do topo do dashboard.

## [1.2.3] - 2026-04-29

### Alterado
- **Layout de Insights e Análises:** Otimização do arranjo de painéis e gráficos para focar nos dados mais expressivos:
  - Excluídos os indicadores de "Análise de Desempenho (Fomento 2026)" (como impacto de nota e eficiência de estados) conforme orientação de relevância momentânea.
  - O gráfico "**Fomento vs. Patrocínio**" foi emparelhado lado a lado com "**CDEN vs. Precursoras**", em tamanho e composição idênticas, melhorando a simetria visual.
  - O gráfico de Evolução sofreu readequação para "**Evolução de Orçamento**", plotando as áreas tanto do Fomento quanto do Patrocínio e ficando reposicionado em largura total logo abaixo dos painéis de representatividade.

## [1.2.2] - 2026-04-29

### Corrigido
- Restaurada a renderização da aba de Insights e Análises que apresentava tela branca ("crash") devido à ausência do componente de Legenda (`Legend`) nos gráficos de pizza.

## [1.2.1] - 2026-04-29

### Adicionado / Melhorado (Insights e Análises Históricas)
- **Painel de Insights Evolutivo:** A aba "Insights e Análises" foi reestruturada para dividir a visão entre o context global/histórico e o ano corrente (Fomento 2026).
- **Novas Análises Globais Incorporadas:**
  - **CDEN vs. Precursoras (Histórico Total):** O comparativo de representatividade agora processa a junção de toda a base de dados de todos os anos (Fomento e Patrocínio), refletindo o engajamento global das entidades.
  - **Fomento vs. Patrocínio:** Inclusão de um novo gráfico circular (PieChart) que consolida a distribuição histórica dos valores concedidos entre as duas frentes.
  - **Evolução do Fomento (2025 x 2026):** Adição de um gráfico de área com preenchimento em gradiente identificando a evolução do investimento total do repasse de Fomento de um ano para o outro.
- **Análises de Desempenho (Fomento 2026):** Todos os indicadores operacionais sensíveis e voltados a cálculos de nota de eficiência — como 'Impacto da Nota Final', 'Estados com Maior Eficiência' e 'Estados com Maior Corte' — foram preservados exatamente em sua estrutura ideal original, passando a explicitar didaticamente que pertencem apenas aos cenários em andamento (Edital 2026).

## [1.2.0] - 2026-04-29

### Adicionado / Melhorado (Atualização Cartográfica)
- **Rótulos Dinâmicos de Entidades no Mapa:**
  - O mapa interativo (Dashboard Global de Entidades) agora plota sobre o centro geográfico de cada estado a quantidade total de entidades distintas atendidas na respectiva UF.
  - **Identificação Visual Inteligente:** Os rótulos numéricos (agora estruturados em 16px e FontWeight 800) sobrepostos no mapa reagem dinamicamente à cor de fundo baseada no volume do repasse. O sistema insere um contraste refinado (texto escuro com sombras claras para fundos brandos e texto branco para estados escuros), assegurando máxima legibilidade.
  - **Atenção a Estados Descobertos:** Estados que não constam evidências de repasse (0 entidades) agora apresentam a indicação numérica '0'. Para complementar didaticamente, aplicou-se também uma base em vermelho pastel para focar atenção gerencial em locais sem histórico de repasses.
- **Tooltip Detalhado Aprimorado:** O painel flutuante via hover além de Nome do Estado, Repasse Total, Fomento e Patrocínio, passou a exibir o detalhamento de Entidades Atendidas.


## [1.1.7] - 2026-04-29

### Adicionado
- **Dashboard Global de Entidades:** O mapa agora exibe o número "0" em destaque para estados que não possuem entidades atendidas. Estes estados também foram realçados com uma cor base levemente avermelhada (vermelho pastel), reforçando visualmente a ausência de repasses no histórico.

## [1.1.6] - 2026-04-29

### Alterado
- **Dashboard Global de Entidades:** A fonte dos rótulos de entidades foi novamente ampliada (agora para 16px) com maior peso (fontWeight: 800) e implementada com contraste dinâmico: as cores das fontes e sombras se alteram magicamente entre escuro e claro dependendo da tonalidade de fundo do estado, garantindo uma máxima legibilidade independentemente do estado focado.

## [1.1.5] - 2026-04-29

### Alterado
- **Dashboard Global de Entidades:** A fonte dos rótulos flutuantes com o número de entidades por estado no mapa foi aumentada para melhorar a legibilidade.

## [1.1.4] - 2026-04-29

### Adicionado
- **Dashboard Global de Entidades:** O mapa interativo de Repasse Total Histórico agora plota sobre o centro geográfico de cada estado (rótulo flutuante) a quantidade total de entidades atendidas na respectiva Unidade Federativa. Esta funcionalidade também foi adicionada de forma detalhada no card interativo (Tooltip).

## [1.1.3] - 2026-04-29

### Alterado
- **Dashboard Global de Entidades:** O layout com três mapas foi simplificado para apresentar um único mapa focado no "Repasse Total Histórico", que agora utiliza toda a área disponível para facilitar a visualização e interação.
- **Tooltip Detalhado:** O tooltip (texto ao passar o mouse) do mapa agora apresenta informações mais granulares, exibindo o Nome do Estado + Sigla, Valor do Repasse Total e detalhamentos específicos de Fomento e Patrocínio simultaneamente.

## [1.1.2] - 2026-04-29

### Alterado
- **Dashboard Global de Entidades:** A aba "Histórico - Entidades" foi reprojetada para oferecer uma visão puramente cartográfica e consolidada.
  - Implementação de 3 mapas topográficos interativos distribuídos na mesma tela (1 mapa grande focando no Repasse Total, e 2 mapas menores lado a lado para Repasses apenas de Fomento e apenas de Patrocínio).
  - A tabela consolidada e interativa com buscas foi movida/restrita apenas para a sub-aba "Diretório de Entidades" para facilitar a análise dos gestores e diminuir a redundância visual.
  - *Correção Visual*: Ajustada a projeção de escala (ViewBox) dos mapas do Brasil para formato 1:1 contínuo e responsivo, prevenindo distorções, alongamentos ou cortes ("clipping") das bordas dos estados independentemente do painel/container em que são renderizados.

## [1.1.1] - 2026-04-29

### Alterado
- **Padronização de Estados:** A informação sobre o Estado (UF) em todos os datasets (Fomento, Patrocínio, etc.) foi padronizada para utilizar o nome completo da Unidade da Federação no lugar de siglas (ex: "São Paulo" ao invés de "SP", "Santa Catarina" no lugar de "SC"). Essa mudança garante consistência na listagem, filtros e também na correspondência interativa dos mapas topográficos nos ambientes analíticos.

## [1.1.0] - 2026-04-29

### Adicionado
- **Histórico Consolidado de Entidades:** Criada a nova aba "Entidades" sob "Histórico", que apresenta o `Diretório Global de Entidades`.
  - Consolida todas as entidades que já participaram de qualquer edital (Fomento ou Patrocínio).
  - Apresenta o Total Histórico Repassado.
  - Demonstra visualmente as proporções (%) de repasse via Fomento e Patrocínio por entidade, incluindo os valores absolutos.
  - Inclui busca otimizada por Nome ou CNPJ e filtros consolidados por Grupo (CDEN/Precursora) e Estado.
  - Ordenação interativa pelas colunas presentes (Ex: Repasse Total, % Fomento).
- **Integração de Temas (Overview e FinancialPanel):** Implementado um sistema de temas (`theme="fomento" | "patrocinio"`) nos componentes `Overview` e `FinancialPanel`. Este sistema permite que os gráficos, mapas e elementos textuais adaptem suas cores de acordo com o contexto em que são renderizados.
- **Identidade Visual Escalonada:**
  - **Fomento:** Os gráficos, mapas, ícones e destaques numéricos na aba "Histórico - Fomento" agora utilizam consistentemente uma paleta baseada em tons de **Verde** (representando crescimento e suporte corporativo).
  - **Patrocínio:** A aba "Histórico - Patrocínio" passa a utilizar uma identidade baseada em tons de **Laranja/Âmbar**, proporcionando rápida identificação visual e alinhamento com os gráficos de comparativos globais.
- **Dashboards Consolidados:** A página de Visão Geral (Overview) foi reestruturada para suportar injeção dinâmica de dados. Com isso, ela passa a atuar como tela "home" oficial (resumo) tanto do `Histórico - Fomento` quanto do `Histórico - Patrocínio`.

### Corrigido
- **Mapeamento Topográfico e Siglas de Estado:** Padronizadas as siglas de estado (coluna `ESTADO`) no parse dos arquivos CSV de Patrocínio. Anteriormente, nomes completos de estados (ex: "São Paulo") estavam impedindo o correto match geográfico do `react-simple-maps`, o que causava o "apagão" da região de mapa de hover ("Investimento por Estado") e de dados vinculados. O sistema de mapas do Histórico de Patrocínio e Fomento passou a refletir os dados de maneira imaculada.

## [1.0.3] - 2026-04-29

### Corrigido
- Substituído `Fomento2026.ts` incorreto pelo arquivo correto com os dados correntes (que reintroduz as colunas originais como OBJETIVO `Direcionamento Estratégico Local`, `Identificação e Proposição de Soluções`, etc).
- Corrigida a lógica de renderização de tags no Diretório de Entidades para mapear automaticamente as cores correspondentes aos objetivos do Fomento (em vez da tag genérica "Fomento 2026").

## [1.0.2] - 2026-04-29

### Corrigido
- Exclusão da tag genérica "Fomento 2026" no Diretório de Entidades da visão corrente (`fomento2026.ts`).
- Restauração da capacidade de leitura das colunas "Objetivo" e "Categoria" dos arquivos CSV, permitindo que a mesma lógica de cores (e.g. Mapeamento de Recursos, Evento, etc) seja usada na tag, mapeando o ID de "Linha Solicitada" se necessário.

## [1.0.1] - 2026-04-29

### Modificado
- Corrigido o fluxo de dados "corrente" x "histórico" para Fomento.
- Removido `selecionados.ts` que se tratava de dados de teste/placeholder e inserido os dados formatados `Fomento2026.ts` como base oficial de fomento do ano atual.
- As abas principais de controle (Diretório, Financeiro, Fiscal etc) agora consomem automaticamente de `fomento2026`.

## [1.0.0] - 2026-04-29

### Adicionado
- Estrutura completa de dados históricos para o programa de Patrocínio (2025) e Fomento (2025).
- Criação das novas abas exclusivas para o histórico:
  - **Histórico - Patrocínio**: Tabela em que constam todos os patrocínios organizados com opção de filtros avançados.
  - **Diretório de Entidades (Patrocínio)**: Listagem detalhada das entidades envolvidas.
  - **Painel Financeiro (Patrocínio)**: Gráficos financeiros de patrocínio que mostram a distribuição de valores.
  - **Fomento**: Tabelas de histórico e informações de todas as abas adaptadas para puxar o CSV original de 2025 no GitHub (via fetch).

### Modificado
- Conversão da base de Fomento de um arquivo estático (`selecionados.ts`) para um CSV autônomo e assincronamente injetável (`fomento2025.ts`).
- Renomeado `patrocinio.ts` para `patrocinio2025.ts` para melhor modularização temporal.
- O carregamento dos dados de histórico de patrocínio 2025 e fomento 2025 agora é assíncrono/pré-processado pelo CSV original do GitHub.
- Nova versão principal lançada (`v1.0.0`) para marcar esse novo marco de desenvolvimento de módulos independentes de histórico e financeiro.
