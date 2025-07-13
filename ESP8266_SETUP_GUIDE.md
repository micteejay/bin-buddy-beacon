# ESP8266 Dual-Bin Waste Monitor Setup Guide

## Hardware Requirements
- 1x ESP8266 (NodeMCU or Wemos D1 Mini)
- 2x Ultrasonic sensors (HC-SR04)
- Jumper wires
- Breadboard
- 5V power supply

## Wiring Diagram

### Sensor 1 (Bin A):
- VCC → 5V
- GND → GND
- Trig → D1 (GPIO5)
- Echo → D2 (GPIO4)

### Sensor 2 (Bin B):
- VCC → 5V
- GND → GND
- Trig → D5 (GPIO14)
- Echo → D6 (GPIO12)

## Arduino Code

```cpp
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>

// WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// API endpoint
const char* serverURL = "https://qksuyfgmebazmslwuqkl.supabase.co/functions/v1/esp8266-data";

// Sensor pins for Bin A
const int trigPin1 = D1;  // GPIO5
const int echoPin1 = D2;  // GPIO4

// Sensor pins for Bin B
const int trigPin2 = D5;  // GPIO14
const int echoPin2 = D6;  // GPIO12

// Bin configurations
const float binHeight1 = 100.0; // Bin A height in cm
const float binHeight2 = 100.0; // Bin B height in cm
const char* binLocation1 = "Bin A - Main Area";
const char* binLocation2 = "Bin B - Secondary Area";

// Timing
unsigned long lastReading = 0;
const unsigned long readingInterval = 30000; // 30 seconds

WiFiClient client;
HTTPClient http;

void setup() {
  Serial.begin(115200);
  
  // Initialize sensor pins
  pinMode(trigPin1, OUTPUT);
  pinMode(echoPin1, INPUT);
  pinMode(trigPin2, OUTPUT);
  pinMode(echoPin2, INPUT);
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println();
  Serial.println("WiFi connected!");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  if (millis() - lastReading >= readingInterval) {
    if (WiFi.status() == WL_CONNECTED) {
      // Read both sensors
      float distance1 = readUltrasonicSensor(trigPin1, echoPin1);
      float distance2 = readUltrasonicSensor(trigPin2, echoPin2);
      
      // Calculate fill levels
      int level1 = calculateFillLevel(distance1, binHeight1);
      int level2 = calculateFillLevel(distance2, binHeight2);
      
      // Send batch data to API
      sendBatchData(level1, level2);
    } else {
      Serial.println("WiFi disconnected, attempting to reconnect...");
      WiFi.reconnect();
    }
    
    lastReading = millis();
  }
  
  delay(1000);
}

float readUltrasonicSensor(int trigPin, int echoPin) {
  // Clear the trigger pin
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  
  // Send 10us pulse
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  
  // Read echo pin
  long duration = pulseIn(echoPin, HIGH, 30000); // 30ms timeout
  
  if (duration == 0) {
    Serial.println("Sensor timeout - check connections");
    return -1;
  }
  
  // Calculate distance in cm
  float distance = duration * 0.034 / 2;
  return distance;
}

int calculateFillLevel(float distance, float binHeight) {
  if (distance <= 0) return -1; // Error reading
  
  // Ensure distance doesn't exceed bin height
  if (distance > binHeight) distance = binHeight;
  
  // Calculate fill percentage (0-100)
  int fillLevel = (int)((binHeight - distance) / binHeight * 100);
  
  // Ensure valid range
  if (fillLevel < 0) fillLevel = 0;
  if (fillLevel > 100) fillLevel = 100;
  
  return fillLevel;
}

void sendBatchData(int level1, int level2) {
  http.begin(client, serverURL);
  http.addHeader("Content-Type", "application/json");
  
  // Create JSON array for batch processing
  StaticJsonDocument<512> doc;
  JsonArray bins = doc.to<JsonArray>();
  
  // Add Bin A data
  if (level1 >= 0) {
    JsonObject bin1 = bins.createNestedObject();
    bin1["bin_id"] = "001";
    bin1["level"] = level1;
    bin1["location"] = binLocation1;
  }
  
  // Add Bin B data
  if (level2 >= 0) {
    JsonObject bin2 = bins.createNestedObject();
    bin2["bin_id"] = "002";
    bin2["level"] = level2;
    bin2["location"] = binLocation2;
  }
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  Serial.println("Sending data: " + jsonString);
  
  int httpResponseCode = http.POST(jsonString);
  
  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.println("HTTP Response: " + String(httpResponseCode));
    Serial.println("Response: " + response);
    
    if (httpResponseCode == 200) {
      Serial.println("✓ Data sent successfully!");
    } else {
      Serial.println("✗ Server error");
    }
  } else {
    Serial.println("✗ Connection error: " + String(httpResponseCode));
  }
  
  http.end();
}

// Alternative: Send individual readings
void sendIndividualData(String binId, int level, String location) {
  http.begin(client, serverURL);
  http.addHeader("Content-Type", "application/json");
  
  StaticJsonDocument<200> doc;
  doc["bin_id"] = binId;
  doc["level"] = level;
  doc["location"] = location;
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  Serial.println("Sending: " + jsonString);
  
  int httpResponseCode = http.POST(jsonString);
  
  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.println("HTTP Response: " + String(httpResponseCode));
    Serial.println("Response: " + response);
  } else {
    Serial.println("Connection error: " + String(httpResponseCode));
  }
  
  http.end();
}
```

## Required Libraries
Install these libraries in Arduino IDE:
1. ESP8266WiFi (built-in)
2. ESP8266HTTPClient (built-in)
3. ArduinoJson (install via Library Manager)

## Configuration Steps

1. **Update WiFi credentials** in the code:
   ```cpp
   const char* ssid = "YOUR_WIFI_SSID";
   const char* password = "YOUR_WIFI_PASSWORD";
   ```

2. **Adjust bin heights** if needed:
   ```cpp
   const float binHeight1 = 100.0; // cm
   const float binHeight2 = 100.0; // cm
   ```

3. **Customize locations**:
   ```cpp
   const char* binLocation1 = "Your Bin A Location";
   const char* binLocation2 = "Your Bin B Location";
   ```

## API Endpoints

### Batch Update (Recommended)
**URL:** `https://qksuyfgmebazmslwuqkl.supabase.co/functions/v1/esp8266-data`
**Method:** POST
**Content-Type:** application/json

**Batch Payload:**
```json
[
  {
    "bin_id": "001",
    "level": 75,
    "location": "Bin A - Main Area"
  },
  {
    "bin_id": "002", 
    "level": 45,
    "location": "Bin B - Secondary Area"
  }
]
```

### Individual Update
**Single Bin Payload:**
```json
{
  "bin_id": "001",
  "level": 75,
  "location": "Bin A - Main Area"
}
```

## Troubleshooting

### Common Issues:
1. **Sensor timeout**: Check wiring connections
2. **WiFi connection failed**: Verify SSID/password
3. **HTTP error 400**: Check JSON format
4. **HTTP error 500**: Check server logs

### Serial Monitor Output:
- Enable Serial Monitor at 115200 baud
- Watch for connection status and sensor readings
- Monitor HTTP response codes

### Testing:
1. Upload code to ESP8266
2. Open Serial Monitor
3. Verify WiFi connection
4. Check sensor readings
5. Monitor API responses
6. View data on dashboard

## Power Considerations
- Use 5V power supply for stable operation
- Consider deep sleep for battery operation
- USB power is suitable for development

## Mounting Tips
- Mount sensors at the top of bins pointing downward
- Ensure sensors are level and stable
- Keep sensors clean for accurate readings
- Consider weatherproofing for outdoor use