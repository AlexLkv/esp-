#include <ArduinoWebsockets.h>
#include <BluetoothSerial.h>

using namespace websockets;

WebsocketsClient client;
BluetoothSerial SerialBT;
const int ledPin = 2;  // GPIO для светодиода

void setup() {
    Serial.begin(115200);
    SerialBT.begin("ESP32-C3");  // Имя Bluetooth устройства
    pinMode(ledPin, OUTPUT);

    client.onMessage([](WebsocketsMessage message) {
        String msg = message.data();
        if (msg == "LED_ON") {
            digitalWrite(ledPin, HIGH);
        } else if (msg == "LED_OFF") {
            digitalWrite(ledPin, LOW);
        }
    });

    client.connect("ws://192.168.1.100:3000");  // IP сервера

    Serial.println("ESP32-C3 готов!");
}

void loop() {
    client.poll();

    if (SerialBT.available()) {
        char command = SerialBT.read();
        if (command == '1') {
            client.send("LED_ON");
        } else if (command == '0') {
            client.send("LED_OFF");
        }
    }
}
