#include <lmic.h>
#include <hal/hal.h>
#include <SPI.h>

int baud_rate = 115200;

// LoRaWAN NwkSKey, network session key
//static const PROGMEM u1_t NWKSKEY[16] = { 0x82, 0xDE, 0xD9, 0x1D, 0x69, 0x58, 0xF3, 0x66, 0xBA, 0x3A, 0x8E, 0x15, 0x77, 0xA7, 0xAB, 0xD8 };  
static const PROGMEM u1_t NWKSKEY[16] = {0x40, 0xBE, 0x38, 0x2D, 0xB8, 0x26, 0x67, 0xBF, 0x91, 0xAE, 0x83, 0x20, 0xC6, 0xD0, 0x9E, 0x06};

// LoRaWAN AppSKey, application session key
static const u1_t PROGMEM APPSKEY[16] = { 0xDA, 0xBF, 0xD5, 0x35, 0x76, 0x48, 0x84, 0x6C, 0x0D, 0x43, 0xBD, 0xC1, 0x96, 0x54, 0x63, 0x91 };

// LoRaWAN end-device address (DevAddr)
//static const u4_t DEVADDR =  0x260C8A4A; // <-- Change this address for every node! For example, our device address is 26022DEN. We will need to replace "DEVICE_ADDRESS_HERE" as 0x26022DEB.
static const u4_t DEVADDR =  0x260C2BE5;


// These callbacks are only used in over-the-air activation, so they are
// left empty here (we cannot leave them out completely unless
// DISABLE_JOIN is set in config.h, otherwise the linker will complain).
// Well alright......
void os_getArtEui (u1_t* buf) { }
void os_getDevEui (u1_t* buf) { }
void os_getDevKey (u1_t* buf) { }

//byte mydata[100];
//uint8_t mydata[] = "Hello, world!";
static osjob_t sendjob;

// Schedule TX every this many seconds (might become longer due to duty
// cycle limitations).
const unsigned TX_INTERVAL = 5;

// Pin mapping
const lmic_pinmap lmic_pins = {
    .nss = 12,//RFM Chip Select
    .rxtx = LMIC_UNUSED_PIN,
    .rst = 7,//RFM Reset
    .dio = {6, 10, 11}, //RFM Interrupt, RFM LoRa pin, RFM LoRa pin
};

void onEvent (ev_t ev) {
    SerialUSB.print(os_getTime());
    SerialUSB.print(": ");
    switch(ev) {
        case EV_SCAN_TIMEOUT:
            SerialUSB.println(F("EV_SCAN_TIMEOUT"));
            break;
        case EV_BEACON_FOUND:
            SerialUSB.println(F("EV_BEACON_FOUND"));
            break;
        case EV_BEACON_MISSED:
            SerialUSB.println(F("EV_BEACON_MISSED"));
            break;
        case EV_BEACON_TRACKED:
            SerialUSB.println(F("EV_BEACON_TRACKED"));
            break;
        case EV_JOINING:
            SerialUSB.println(F("EV_JOINING"));
            break;
        case EV_JOINED:
            SerialUSB.println(F("EV_JOINED"));
            break;
        case EV_RFU1:
            SerialUSB.println(F("EV_RFU1"));
            break;
        case EV_JOIN_FAILED:
            SerialUSB.println(F("EV_JOIN_FAILED"));
            break;
        case EV_REJOIN_FAILED:
            SerialUSB.println(F("EV_REJOIN_FAILED"));
            break;
        case EV_TXCOMPLETE:
            SerialUSB.println(F("EV_TXCOMPLETE (includes waiting for RX windows)"));
            if (LMIC.txrxFlags & TXRX_ACK)
              SerialUSB.println(F("Received ack"));
            if (LMIC.dataLen) {
              SerialUSB.println(F("Received "));
              SerialUSB.println(LMIC.dataLen);
              SerialUSB.println(F(" bytes of payload"));
            }
            // Schedule next transmission
            os_setTimedCallback(&sendjob, os_getTime()+sec2osticks(TX_INTERVAL), do_send);
            break;
        case EV_LOST_TSYNC:
            SerialUSB.println(F("EV_LOST_TSYNC"));
            break;
        case EV_RESET:
            SerialUSB.println(F("EV_RESET"));
            break;
        case EV_RXCOMPLETE:
            // data received in ping slot
            SerialUSB.println(F("EV_RXCOMPLETE"));
            break;
        case EV_LINK_DEAD:
            SerialUSB.println(F("EV_LINK_DEAD"));
            break;
        case EV_LINK_ALIVE:
            SerialUSB.println(F("EV_LINK_ALIVE"));
            break;
         default:
            SerialUSB.println(F("Unknown event"));
            break;
    }
}


static uint8_t placeholder[] = "No Data from UART"; 
//String rx_str;

char rx_str[24];
byte rx_data[64]; 
int rx_len;

void do_send(osjob_t* j){
    // Check if there is not a current TX/RX job running
    if (LMIC.opmode & OP_TXRXPEND) {
        SerialUSB.println(F("OP_TXRXPEND, not sending"));
    }
    else{
          if (Serial1.available() > 0) {
            memset(rx_data, 0, 64);
            delay(500);
            //            rx_str = Serial1.readString();
            //            SerialUSB.println(rx_str);
            //rx_len = Serial1.readBytesUntil(byte(atoi("!")), rx_data, 17);
            Serial1.readBytes(rx_data, 64);
            //      rx_len = Serial1.readBytesUntil(byte(atoi("d")), rx_data, 40);
      //      rx_len = Serial1.readBytes(rx_data, 24);
            SerialUSB.println("Message Recieved from UART:");
            SerialUSB.println("-----------------------");
            //SerialUSB.write(rx_data, rx_len);
            SerialUSB.println((char*)rx_data);
            SerialUSB.println("-----------------------");
            LMIC_setTxData2(1, (uint8_t*)rx_data, rx_len, 0);
            while(Serial1.read()>=0){}
            delay(200);
            Serial1.flush();
          }
          else {
//            placeholder.getBytes(mydata, 99);
              SerialUSB.println(String((char*)placeholder));
              LMIC_setTxData2(1, placeholder, sizeof(placeholder)-1, 0);
          }
        // Prepare upstream data transmission at the next possible time.
        
        SerialUSB.println(F("Packet queued"));
    // Next TX is scheduled after TX_COMPLETE event.
    }
}

void setup() {
    Uart Serial1( &sercom0, PIN_SERIAL1_RX, PIN_SERIAL1_TX, PAD_SERIAL1_RX, PAD_SERIAL1_TX ) ;
    Serial1.begin(baud_rate);       // initialize UART with baud rate of 9600 bps
    
    SerialUSB.begin(baud_rate);
    // Serial communication on startup is not consistent on the SAMD21. The
    // following line waits for the serial monitor to be opened before
    // continuing. Uncomment if not needed.
    while(!SerialUSB); 
    SerialUSB.println("Starting");

    // LMIC init
    os_init();
    // Reset the MAC state. Session and pending data transfers will be discarded.
    LMIC_reset();

    // Set static session parameters. Instead of dynamically establishing a session
    // by joining the network, precomputed session parameters are be provided.
    #ifdef PROGMEM
    // On AVR, these values are stored in flash and only copied to RAM
    // once. Copy them to a temporary buffer here, LMIC_setSession will
    // copy them into a buffer of its own again.
    uint8_t appskey[sizeof(APPSKEY)];
    uint8_t nwkskey[sizeof(NWKSKEY)];
    memcpy_P(appskey, APPSKEY, sizeof(APPSKEY));
    memcpy_P(nwkskey, NWKSKEY, sizeof(NWKSKEY));
    LMIC_setSession (0x1, DEVADDR, nwkskey, appskey);
    #else
    // If not running an AVR with PROGMEM, just use the arrays directly
    LMIC_setSession (0x1, DEVADDR, NWKSKEY, APPSKEY);
    #endif

    #if defined(CFG_us915)
    // NA-US channels 0-71 are configured automatically
    // but only one group of 8 should (a subband) should be active
    // TTN recommends the second sub band, 1 in a zero based count.
    // https://github.com/TheThingsNetwork/gateway-conf/blob/master/US-global_conf.json
    LMIC_selectSubBand(1);
    #endif

    // Disable link check validation
    LMIC_setLinkCheckMode(0);

    // TTN uses SF9 for its RX2 window.
    LMIC.dn2Dr = DR_SF9;

    // Set data rate and transmit power for uplink (note: txpow seems to be ignored by the library)
    LMIC_setDrTxpow(DR_SF7,14);
    
    // Start job
    do_send(&sendjob);
    Serial1.flush();
}

void loop() {
  os_runloop_once();
//  if (Serial1.available()>0) {
//    SerialUSB.println(Serial1.available());
//    rx_str = Serial1.readString();  
//    SerialUSB.println(rx_str);
//    rx_str.getBytes(mydata, 99);
//    do_send(&sendjob);
//    Serial1.flush();
//  }  
}
