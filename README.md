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
Utilizei o programa Google Colab para o fornecimento dos prompts necessários, instalando bibliotecas como o Numpy, Pandas e o Networkx para utilizar os algorítmos de grafos, o programa K-Means para a visualização dos mapas.

# Algorítimos Utilizados:
A*, K-Means

# Modelos usados na solução do problema:
Estudo de caso da UPS – ORION
https://www.wired.com/2013/06/ups-astronomical-math?utm_source=chatgpt.com


# Análise dos Resultados
Os resultados do desenvolvimento do programa são positivos, pois ajudou a encontrar qual é o caminho mais curto a ser utilizado para uma entrega.



# Como usar o aplicativo:
1. Baixe o Arquivo e Abra o Google Colab
2.  Importe as seguintes bibliotecas:
   Numpy
   Pandas
   Networkx
   Matplotlib.pyplot
   KMeans (do Sklearn)
   Standard Scaler (do Sklearn)
   deque do collections
   Heapq Usado para a fila de prioridade no A*
 3. Adicione primeiro o arquivo "Grafo_Arestas_csv"
 4. Por último insira o arquivo "Grafo_Arestas_csv", todos dentro da pasta docs
 5. Na parte Simulação dos Pedidos (Pontos de Entrega) Altere os parâmetros do número de pedidos para qualquer número (20,40,45)
 6. Execute o comando e veja o resultado
