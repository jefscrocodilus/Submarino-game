# Jogo do Submarino

Um jogo de ação subaquático onde você controla um submarino e deve destruir embarcações inimigas através de três fases progressivamente mais desafiadoras.

## Características do Jogo

### Jogabilidade
- **Objetivo**: Destruir navios inimigos e sobreviver às três fases
- **Controles**: 
  - Teclado: Use as setas ou WASD para mover, Espaço para atirar
  - Mobile: Toque na tela para mover o submarino, toque para atirar
- **Sistema de Vida**: O jogador começa com 100 pontos de vida
- **Sistema de Pontuação**: Ganhe pontos destruindo inimigos

### Inimigos
1. **Submarinos** (100 pontos) - Inimigos básicos, aparecem em todas as fases
2. **Corvetas** (200 pontos) - Aparecem a partir da Fase 2
3. **Fragatas** (300 pontos) - Aparecem a partir da Fase 3
4. **Destróieres** (500 pontos) - Inimigos mais poderosos, aparecem na Fase 3

### Progressão das Fases
- **Fase 1**: Apenas submarinos inimigos
- **Fase 2**: Submarinos e corvetas (desbloqueada com 1000 pontos)
- **Fase 3**: Todos os tipos de inimigos (desbloqueada com 2000 pontos)

### Recursos Visuais
- Imagens realistas de submarinos e embarcações militares
- Ambiente subaquático com gradiente azul profundo
- Efeitos visuais de tiro e explosões
- Interface minimalista e funcional

## Compatibilidade
- **Desktop**: Funciona em qualquer navegador moderno
- **Mobile**: Otimizado para dispositivos móveis com controles touch
- **Responsivo**: Adapta-se automaticamente ao tamanho da tela

## Tecnologias Utilizadas
- HTML5 Canvas para renderização
- JavaScript puro para lógica do jogo
- CSS3 para estilização e efeitos visuais
- Imagens realistas pesquisadas e otimizadas

## Como Jogar
1. Abra o arquivo `index.html` em um navegador
2. Clique em "Iniciar Jogo"
3. Use os controles para mover seu submarino
4. Atire nos inimigos para destruí-los
5. Sobreviva e avance pelas três fases

## Estrutura dos Arquivos
```
submarine-game/
├── index.html          # Arquivo principal do jogo
├── game.js             # Lógica do jogo
├── README.md           # Esta documentação
├── player-submarine.jpg # Imagem do submarino do jogador
├── enemy-submarine1.jpg # Imagem de submarino inimigo 1
├── enemy-submarine2.jpg # Imagem de submarino inimigo 2
├── corvette.jpg        # Imagem da corveta
├── frigate.jpg         # Imagem da fragata
└── destroyer.jpg       # Imagem do destróier
```

## Desenvolvido por
Este jogo foi desenvolvido como um projeto completo de aplicativo móvel, incluindo pesquisa de recursos visuais realistas, design de interface, implementação da mecânica de jogo e otimização para dispositivos móveis.

