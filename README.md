# Dashboard ESP32 - Monitoramento Ambiental

Este projeto fornece uma interface web moderna para visualizar dados de sensores de temperatura e umidade em tempo real de um sistema ESP32.

## 📋 Características

- **Interface Responsiva**: Funciona perfeitamente em desktop, tablet e mobile
- **Gráficos em Tempo Real**: Visualização dinâmica dos dados dos sensores usando Chart.js
- **Design Moderno**: Interface limpa e profissional com gradientes e animações
- **Organização por Tópicos**: Dados separados em seções claras (Temperatura, Umidade do Ar, Umidade do Solo)
- **Indicadores de Status**: Mostra status de conexão e tendências dos valores
- **Informações do Sistema**: Exibe detalhes técnicos e uptime

## 🚀 Como Usar

### 1. Configuração do ESP32

Certifique-se de que seu ESP32 está executando o código fornecido e conectado à rede Wi-Fi. O código deve estar servindo dados no endpoint `/dados`.

### 2. Configuração da Página Web

1. **Alterar o IP do ESP32**: 
   - Abra o arquivo `script.js`
   - Na linha 2, altere o valor de `ESP32_IP` para o IP do seu ESP32:
   ```javascript
   ESP32_IP: 'http://192.168.1.100', // Altere para o IP do seu ESP32
   ```

2. **Abrir a Página**:
   - Abra o arquivo `index.html` em qualquer navegador web moderno
   - A página começará automaticamente a buscar dados do ESP32

### 3. Funcionalidades da Interface

#### Cards de Valores Atuais
- **Temperatura do Ar**: Mostra a temperatura atual em °C
- **Umidade do Ar**: Mostra a umidade relativa do ar em %
- **Umidade do Solo**: Mostra a umidade do solo em %
- **Indicadores de Tendência**: Setas que mostram se o valor está subindo, descendo ou estável

#### Gráficos em Tempo Real
- **Três gráficos separados** para cada tipo de sensor
- **Controles de período**: Botões para visualizar dados de 1h, 6h ou 24h (funcionalidade futura)
- **Atualização automática** a cada 5 segundos
- **Máximo de 50 pontos** por gráfico para melhor performance

#### Informações do Sistema
- **Última Atualização**: Timestamp da última leitura
- **Intervalo de Leitura**: Frequência de atualização (5 segundos)
- **Detalhes dos Sensores**: Informações sobre DHT11 e pinos utilizados
- **Uptime**: Tempo de funcionamento da página

## 🔧 Configurações Avançadas

### Alterar IP do ESP32 via Console
Você pode alterar o IP do ESP32 dinamicamente usando o console do navegador:
```javascript
ESP32Dashboard.setIP('http://192.168.1.200');
```

### Exportar Dados
Para exportar os dados coletados:
```javascript
ESP32Dashboard.exportData();
```

### Verificar Status de Conexão
```javascript
ESP32Dashboard.isConnected();
```

## 📱 Responsividade

A interface foi projetada para funcionar perfeitamente em:
- **Desktop**: Layout em grid com múltiplas colunas
- **Tablet**: Layout adaptado com menos colunas
- **Mobile**: Layout em coluna única com elementos otimizados para toque

## 🎨 Personalização

### Cores dos Gráficos
As cores podem ser alteradas no arquivo `script.js` na seção `CHART_COLORS`:
```javascript
CHART_COLORS: {
    temperature: {
        background: 'rgba(255, 107, 107, 0.2)',
        border: '#ff6b6b'
    },
    // ...
}
```

### Intervalo de Atualização
Para alterar a frequência de atualização, modifique `UPDATE_INTERVAL` no `script.js`:
```javascript
UPDATE_INTERVAL: 5000, // 5 segundos (em milissegundos)
```

### Número Máximo de Pontos nos Gráficos
Para alterar quantos pontos são mantidos nos gráficos:
```javascript
MAX_DATA_POINTS: 50, // Número de pontos
```

## 🔍 Solução de Problemas

### Página não conecta ao ESP32
1. Verifique se o IP está correto no `script.js`
2. Certifique-se de que o ESP32 está na mesma rede
3. Verifique se o ESP32 está respondendo acessando `http://IP_DO_ESP32/dados` diretamente

### Gráficos não aparecem
1. Verifique se há erros no console do navegador (F12)
2. Certifique-se de que o Chart.js está carregando corretamente
3. Verifique a conexão com a internet para carregar as bibliotecas CDN

### Interface não responsiva
1. Verifique se a meta tag viewport está presente no HTML
2. Teste em diferentes navegadores
3. Limpe o cache do navegador

## 📋 Estrutura dos Arquivos

```
esp32-dashboard/
├── index.html      # Página principal
├── style.css       # Estilos e responsividade
├── script.js       # Lógica JavaScript e gráficos
└── README.md       # Este arquivo
```

## 🔗 Dependências

- **Chart.js**: Biblioteca para gráficos (carregada via CDN)
- **Font Awesome**: Ícones (carregado via CDN)
- **Google Fonts**: Fonte Inter (carregada via CDN)

## 📄 Licença

Este projeto é de uso livre para fins educacionais e pessoais.

## 🤝 Suporte

Para dúvidas ou problemas:
1. Verifique a seção de solução de problemas
2. Consulte a documentação do ESP32
3. Verifique os logs no console do navegador

