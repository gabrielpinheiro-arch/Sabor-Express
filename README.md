<img width="9846" height="2832" alt="UniFECAF - Color (1)" src="https://github.com/user-attachments/assets/fafeb67b-6f6d-466d-9983-0f94f0b20045" />


Atividade para o curso de Artificial Intelligence Fundamentals da UniFECAF
Nome: Gabriel Luiz Pinheiro
RA: 106503
Curso: Gestão da Tecnologia da Informação
Semestre: 4º
Instituição: UniFECAF


# Descrição do desafio
Fui contratado por uma pequena empresa local de delivery de alimentos, chamada
“Sabor Express”, que atua na região central da cidade. Essa empresa tem enfrentado
grandes desafios para gerenciar suas entregas durante horários de pico, especialmente em
períodos de alta demanda, como hora do almoço e jantar. Frequentemente, os
entregadores demoram mais que o previsto, percorrendo rotas ineficientes, o que gera
atrasos, aumento no custo de combustível e, consequentemente, insatisfação dos clientes.
O proprietário da empresa percebe que, para se manter competitivo no mercado, é
essencial tornar as entregas mais rápidas, eficientes e econômicas. Atualmente, os
percursos são definidos de forma manual, baseados apenas na experiência dos
entregadores, sem qualquer apoio tecnológico.
Diante desse cenário, minha missão é desenvolver uma solução inteligente, baseada em
algoritmos de Inteligência Artificial, capaz de sugerir as melhores rotas para os
entregadores. Para isso, considerei a cidade como um grafo, onde os pontos
representam bairros ou locais de entrega e as arestas representam as ruas, com pesos
baseados em distância ou tempo estimado.
O problema a ser resolvido consiste em implementar um algoritmo que encontre, de
forma eficiente, o menor caminho entre múltiplos pontos de entrega, considerando as
restrições urbanas. Além disso, em situações com muitos pedidos, utilizei algoritmos de clustering,
otimizando o trabalho dos entregadores.
como algorítimos de busca em largura/profundidade, utilizei o algorítimo A* além de realizar representação de problemas com grafos, e aprendizado
não supervisionado como K-Means para agrupar entregas em zonas eficientes. Além
disso, foi se necessário avaliar e comparar as soluções propostas com métricas adequadas.

# Descrição da abordagem adotada
Utilizei os programas Google AI Studio e o Gemini para o fornecimento dos prompts necessários, para utilizar os algorítmos de grafos, além de integrar o open street map para a visualização dos mapas além de utilizar uma API com informações em tempo real sobre o trânsito nas ruas de São Paulo, Integrando também uma validação de endereço em tempo real para os campos de endereço da sede e de entrega comm uma API de geocodificação para verificar a validade dos endereços à medida que o usuário digita, fornecendo feedback imediato.

# Algorítimos Utilizados:
A*, K-Means

# Modelo usado na solução do problema:
Imagem estática do open street map

# Análise dos Resultados
Os resultados do desenvolvimento do programa são positivos, pois ajudou a encontrar qual é o caminho mais curto a ser utilizado para uma entrega. A limitação encontrada é na hora de fazer o deploy do aplicativo, fazendo a inserção de uma Chave API do Gemini.

Visualização do aplicativo:
https://ai.studio/apps/drive/1TEiUWnGgw7IApQhvkERjqE_SUdTuvbQn

# Prévia:
<img width="1360" height="768" alt="Captura de Tela (82)" src="https://github.com/user-attachments/assets/5d4ea7c3-a1e1-47f9-ad77-7fa5c3688891" />


# Como usar o aplicativo:
1. Digite o endereço da sede com rua, número, bairro, cidade e estado.
2. Faça a mesma coisa digitando o endereço de entrega, só podendo ser um por linha.
3. Defina o número de entregadores.
4. Defina a duração de parada e clique em otimizar rotas.
5. Pronto! A distância mais próxima do local de entrega é apresentada.
