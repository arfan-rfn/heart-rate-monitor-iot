/*
 * network_manager.h - Network Communication Manager
 * 
 * Handles all network communication between the IoT device and API server.
 * Supports two connection modes controlled by USE_WEBHOOK in config.h:
 * 
 * DIRECT HTTP MODE (USE_WEBHOOK false):
 *   - Connects directly to API server via TCP/HTTP
 *   - Used for local development with api-server on localhost
 *   - Device makes HTTP requests to API_SERVER_HOST:API_SERVER_PORT
 *   - API key sent in X-API-Key header
 * 
 * WEBHOOK MODE (USE_WEBHOOK true):
 *   - Publishes events to Particle Cloud
 *   - Particle webhooks forward requests to Vercel HTTPS API
 *   - API key included in JSON payload (webhook extracts for header)
 *   - Requires webhook configuration in Particle Console
 * 
 * Features:
 *   - Measurement transmission to POST /api/measurements
 *   - User timeout notifications to POST /api/notifications  
 *   - Device config fetching from GET /api/devices/{id}/config
 *   - Offline storage in EEPROM with auto-sync on reconnect:
 *     * Measurements: Up to 48 stored offline
 *     * Timeout notifications: Up to 24 stored offline
 *     * Data persists across device reboots
 */

#ifndef NETWORK_MANAGER_H
#define NETWORK_MANAGER_H

#include "Particle.h"
#include "config.h"
#include "sensor_manager.h"

/*
 * StoredMeasurement - Structure for offline measurement storage
 * 
 * When WiFi is unavailable, measurements are stored in EEPROM
 * and automatically synced when connectivity is restored.
 */
struct StoredMeasurement {
    float heartRate;      // Heart rate in BPM
    float spO2;           // Blood oxygen percentage
    uint32_t timestamp;   // Unix timestamp of measurement
    bool transmitted;     // True if already sent to server
};

/*
 * StoredTimeout - Structure for offline timeout event storage
 * 
 * When WiFi is unavailable, timeout notifications are stored in EEPROM
 * and automatically synced when connectivity is restored.
 */
struct StoredTimeout {
    uint32_t timestamp;   // Unix timestamp of timeout event
    bool transmitted;     // True if already sent to server
};

// Maximum number of timeout events to store offline
#define MAX_STORED_TIMEOUTS 24

// Forward declaration for static webhook callback
class NetworkManager;

// Global pointer for static callback (Particle.subscribe requires static/free function)
extern NetworkManager* networkManagerInstance;

/*
 * NetworkManager - Handles API communication and offline storage
 * 
 * Primary responsibilities:
 *   1. Transmit measurements to API server (or store if offline)
 *   2. Fetch device configuration from server
 *   3. Send timeout notifications (or store if offline)
 *   4. Store measurements offline when disconnected (up to 48)
 *   5. Store timeout notifications offline when disconnected (up to 24)
 *   6. Auto-sync all stored data when WiFi reconnects
 */
class NetworkManager {
public:
    NetworkManager();
    
    /*
     * Initialize network manager.
     * Sets up webhook subscriptions (if USE_WEBHOOK) and loads stored measurements.
     */
    void begin();
    
    /*
     * Periodic update - call from main loop.
     * Handles connection monitoring, config fetching, and stored measurement sync.
     */
    void update();
    
    /*
     * Check if device is connected to appropriate network.
     * - Webhook mode: Returns true if connected to Particle Cloud
     * - HTTP mode: Returns true if WiFi is ready
     */
    bool isConnected();
    
    /*
     * Transmit a measurement to the API server.
     * Routes to either webhook publish or direct HTTP POST based on USE_WEBHOOK.
     * Stores measurement locally if offline.
     */
    bool transmitMeasurement(MeasurementData data);
    
    /*
     * Store measurement in EEPROM for later transmission.
     * Called when device is offline or transmission fails.
     */
    void storeMeasurement(MeasurementData data);
    
    /*
     * Sync stored measurements to server.
     * Called automatically when WiFi reconnects.
     */
    void syncStoredMeasurements();
    
    /*
     * Send notification when user fails to respond to measurement prompt.
     * Posts to /api/notifications endpoint.
     * If offline, stores timeout for later transmission.
     */
    bool sendTimeoutNotification();
    
    /*
     * Store timeout notification in EEPROM for later transmission.
     * Called when device is offline.
     */
    void storeTimeoutNotification(uint32_t timestamp);
    
    /*
     * Sync stored timeout notifications to server.
     * Called automatically when WiFi reconnects.
     */
    void syncStoredTimeouts();
    
    /*
     * Fetch device configuration from server.
     * Gets measurement frequency, active hours, etc. from /api/devices/{id}/config
     */
    void fetchDeviceConfig();
    
    /*
     * Check if a config fetch request is pending (webhook mode).
     */
    bool isConfigFetchPending();
    
    /*
     * Check if config was successfully fetched from server.
     */
    bool isConfigFetched();
    
    /*
     * Handle webhook response for config fetch.
     * Called by static wrapper when Particle receives hook-response event.
     */
    void handleConfigResponse(const char *event, const char *data);
    
private:
    bool wifiConnected;              // Current WiFi connection state
    bool wasWifiConnected;           // Previous state for reconnection detection
    int retryCount;                  // Transmission retry counter
    unsigned long lastConnectionCheck;
    unsigned long lastConfigFetch;
    bool configFetchPending;         // True while waiting for webhook response
    bool configFetchedSuccessfully;  // True after successful config fetch
    int configFetchAttempts;         // Attempts since boot/reconnect
    static const int MAX_CONFIG_FETCH_ATTEMPTS = 3;
    unsigned long configRequestTime; // For webhook response timeout
    
    // Offline storage - measurements
    StoredMeasurement storage[MAX_STORED_MEASUREMENTS];
    int storageIndex;
    int storedCount;
    
    // Offline storage - timeout notifications
    StoredTimeout timeoutStorage[MAX_STORED_TIMEOUTS];
    int timeoutStorageIndex;
    int storedTimeoutCount;
    
    /*
     * POST measurement JSON to API server.
     * Uses webhook publish or direct HTTP based on USE_WEBHOOK.
     */
    bool postMeasurement(String jsonPayload);
    
    // Legacy methods (kept for compatibility, route to postMeasurement)
    bool sendDirectHTTP(String jsonPayload, const char* host, int port, bool useHttps);
    bool sendToProxy(String jsonPayload);
    bool sendToServer(String jsonPayload);
    void webhookResponseHandler(const char *event, const char *data);
    void configResponseHandler(const char *event, const char *data);
    void fetchConfigDirectHTTP(const char* host, int port, bool useHttps);
    
    /*
     * Create JSON payload for measurement submission.
     * Includes deviceId, heartRate, spO2, timestamp, quality, confidence.
     * Webhook mode also includes apiKey in payload.
     */
    String createJSON(MeasurementData data);
    
    // EEPROM persistence
    void saveToEEPROM();
    void loadFromEEPROM();
    int findNextStoredMeasurement();
    int findNextStoredTimeout();
    bool postTimeoutNotification(String jsonPayload);
    
    // JSON parsing helpers for config response
    String extractJsonValue(String json, String key);
    int extractJsonInt(String json, String key);
};

#endif // NETWORK_MANAGER_H
