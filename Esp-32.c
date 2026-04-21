#include <dummy.h>

#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <DHT.h>

// --- Pinos ---
#define SOIL_MOISTURE_PIN 14 // Umidade do Solo
#define DHT_PIN 18           // DHT11
#define RELAY_FAN 32         // Relé Ventilador
#define RELAY_PUMP 33        // Relé Bomba
#define DHTTYPE DHT11

// --- Objetos ---
DHT dht(DHT_PIN, DHTTYPE);
LiquidCrystal_I2C lcd(0x27, 16, 2); // Endereço 0x27 (padrão)

// --- Variáveis ---
int soilMoisture = 0;
float temperature = 0;
float humidity = 0;

void setup()
{
    Serial.begin(115200);
    dht.begin();
    lcd.init();
    lcd.backlight();

    // Relés como saída
    pinMode(RELAY_FAN, OUTPUT);
    pinMode(RELAY_PUMP, OUTPUT);

    // Desliga os relés inicialmente
    digitalWrite(RELAY_FAN, LOW);
    digitalWrite(RELAY_PUMP, LOW);

    // Mensagem inicial no LCD
    lcd.setCursor(0, 0);
    lcd.print("Sistema Irrig.");
    lcd.setCursor(0, 1);
    lcd.print("Iniciando...");
    delay(2000);
}

void loop()
{
    // --- Ler sensores ---
    soilMoisture = analogRead(SOIL_MOISTURE_PIN);
    humidity = dht.readHumidity();
    temperature = dht.readTemperature();

    // --- Exibir no LCD ---
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("U:");
    lcd.print(humidity);
    lcd.print("% T:");
    lcd.print(temperature);

    lcd.setCursor(0, 1);
    lcd.print("Solo:");
    lcd.print(soilMoisture);

    // --- Controle Bomba (umidade do solo) ---
    if (soilMoisture < 1500)
    {                                   // Ajuste conforme necessidade
        digitalWrite(RELAY_PUMP, HIGH); // Liga bomba
    }
    else
    {
        digitalWrite(RELAY_PUMP, LOW); // Desliga bomba
    }

    // --- Controle Ventilador (temperatura) ---
    if (temperature > 30)
    {                                  // Ajuste conforme necessidade
        digitalWrite(RELAY_FAN, HIGH); // Liga ventilador
    }
    else
    {
        digitalWrite(RELAY_FAN, LOW); // Desliga ventilador
    }

    // --- Debug Serial ---
    Serial.print("Umidade Solo: ");
    Serial.print(soilMoisture);
    Serial.print(" | Umidade Ar: ");
    Serial.print(humidity);
    Serial.print(" | Temp: ");
    Serial.println(temperature);

    delay(2000); // Espera 2 segundos
}