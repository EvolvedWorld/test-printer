import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ReactNativePosPrinter,
  ThermalPrinterDevice,
} from 'react-native-thermal-pos-printer';
import { toThermalBase64 } from './src/functions/toThermalBase64';

const defaultHeader = [
  {
    content: 'Paratodos - Itabaianinha\n\n',
    style: {
      align: 'LEFT',
      size: 10,
      fontType: 'A',
    },
  },
  {
    content: 'Via do cliente\n\n',
    style: {
      align: 'LEFT',
      size: 8,
      fontType: 'A',
    },
  },
  {
    content: '03/09/2025 09:00:22',
    style: {
      align: 'LEFT',
      size: 8,
      fontType: 'A',
    },
  },
  {
    content: 'PULE: 0110',
    style: {
      align: 'LEFT',
      size: 14,
      bold: true,
      fontType: 'A',
    },
  },
  {
    content: 'Data da aposta: 03/06/2025',
    style: {
      align: 'LEFT',
      size: 8,
      fontType: 'A',
    },
  },
  {
    content: 'Extração: 13h-Abaese',
    style: {
      align: 'LEFT',
      size: 8,
      fontType: 'A',
    },
  },
  {
    content: 'Cambista: 1055 - Teste Marc',
    style: {
      align: 'LEFT',
      size: 8,
      fontType: 'A',
    },
  },
];

export const Home = () => {
  const [devices, setDevices] = useState<ThermalPrinterDevice[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const initPrinter = async () => {
      try {
        await ReactNativePosPrinter.init();
        console.log('Printer initialized');
      } catch (err) {
        console.error('Printer init failed:', err);
      }
    };
    initPrinter();
  }, []);

  const getDevices = async () => {
    try {
      const list = await ReactNativePosPrinter.getDeviceList();
      console.log('Available devices:', list);
      setDevices(list);
    } catch (err) {
      console.error('Failed to get devices:', err);
    }
  };

  const printSample = async (device: ThermalPrinterDevice) => {
    try {
      setIsLoading(true);
      await device.connect({
        timeout: 5000,
        encoding: 'UTF-8',
      });

      if (!(await device.isConnected())) {
        await device.connect({
          timeout: 5000,
          encoding: 'UTF-8',
        });
      }

      const status = await device.getStatus();

      console.log('status: ', status);

      // Checks the printer paper state
      if (status.paperOut) {
        throw new Error('Impressora conectada, mas sem papel!');
      }

      const grayScaleImage = await toThermalBase64(
        'https://paratodos-dev-e0fa7.web.app/logo_paratodos_mini.png',
      );

      console.log('grayScaleImage: ', grayScaleImage);

      await device.printText('-----------------------------');

      // // Exemplos de uso com diferentes tamanhos
      // await device.printQRCode('https://www.cristianaragao.com/', {
      //   size: 3, // QR code pequeno
      //   align: 'CENTER',
      //   errorLevel: 'M',
      // });

      // await device.printQRCode('https://www.cristianaragao.com/', {
      //   size: 8, // QR code médio
      //   align: 'CENTER',
      //   errorLevel: 'H',
      // });

      // await device.printQRCode('https://www.cristianaragao.com/', {
      //   size: 15, // QR code grande
      //   align: 'CENTER',
      //   errorLevel: 'L',
      // });
      // let svgBase64 = await getBase64FromUrl(
      //   'https://paratodos-dev-e0fa7.web.app/logo_paratodos_mini.png',
      // );

      // svgBase64 = svgBase64.replace('data:application/octet-stream', '');
      // console.log('svgBase64: ', svgBase64);
      // await device.printImage(svgBase64, {
      //   align: 'CENTER',
      // });

      await device.printImage(base64, {
        align: 'CENTER',
        width: 120,
        height: 120
      });

      for (const row of defaultHeader) {
        await device.printText(
          `${row.content}`,
          row.style as any,
        );
      }
      await device.printText('\n' + '-'.repeat(32));
      // Fake content
      await device.printText('APOSTAS\n', {
        align: 'CENTER',
        size: 10,
        fontType: 'A',
      });
      await device.printText('\n' + '-'.repeat(32) + '\n');
      await device.printText('MILHAR', {
        align: 'LEFT',
        bold: true,
        size: 12,
        fontType: 'A',
      });
      await device.printText('6589 0825', {
        bold: true,
        size: 12,
        align: 'LEFT',
        fontType: 'A',
      });

      let calculateDots = 32;
      await device.printText(
        `M 1 ${'.'.repeat(calculateDots - (4 + 17))}R$0,05\n\n\n`,
        {
          align: 'LEFT',
          bold: true,
          size: 12,
          fontType: 'A',
        },
      );
      await device.printText(
        `Total: ${' '.repeat(8)}R$0,05\n\n`,
        {
          align: 'LEFT',
          bold: true,
          size: 12,
          fontType: 'A',
        },
      );

      await device.printQRCode(
        `MILHAR
        6589 0852
        M 1 ${'.'.repeat(calculateDots - (4 + 17))}R$0,00\n\n\n
        Total: ${' '.repeat(5)}R$0,05\n\n
        `,
        {
          align: 'CENTER',
          size: 6,
          errorLevel: 'H',
        },
      );
      await ReactNativePosPrinter.feedLine();
      await device.disconnect();
      console.log('Printed successfully!');
    } catch (err) {
      console.error('Printing failed:', err);
      await ReactNativePosPrinter.disconnectPrinter();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading && <ActivityIndicator />}
      <View style={{ padding: 20 }}>
        <View
          style={{
            marginVertical: 8,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              color: 'white',
            }}
          >
            Thermal Printer Demo
          </Text>
        </View>
        <TouchableOpacity
          style={{
            backgroundColor: '#1976D2',
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 8,
          }}
          onPress={getDevices}
        >
          <Text
            style={{
              color: 'white',
              textAlign: 'center',
            }}
          >
            Get Devices
          </Text>
        </TouchableOpacity>
        <ScrollView
          contentContainerStyle={{
            gap: 8,
          }}
          style={{
            marginTop: 16,
          }}
        >
          {devices.map((d, idx) => (
            <TouchableOpacity
              key={idx}
              style={{
                backgroundColor: 'white',
                width: '100%',
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 8,
              }}
              onPress={() => printSample(d)}
            >
              <Text
                style={{
                  fontWeight: 'bold',
                  textAlign: 'center',
                }}
              >{`Print on ${d.getName()}`}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </>
  );
};

const base64 = "iVBORw0KGgoAAAANSUhEUgAAAGQAAABtCAYAAABX7cScAAAABHNCSVQICAgIfAhkiAAAAxRJREFUeJztndFuwjAMRd1p///L2RMSTJTGjtOcG3weJ40aH98UUgpHa61ZgeFndQHFKyUERgmBUUJglBAYJQRGCYFRQmBsI+Q4jtUlpLCFkIeMHaTIC9lBwjPyQv6jLkhaiHrz3yEt5AxlUbJCrpquKkVWyK5ICumdfsWUyAlRbLIHOSFe1ARKCYk2V0mKlJBvQEbI6JSrpERGyCdaa7bLp5kkhPRO95UUhZTghVw18b8E9aTghWRDTwlaiDcdV3/vfdyVoIV8Qn1pOgMrZHSKVVOCFBJdqnYAKeQuiCk5eu8PIRavRk+rvzohd9K7zHYL2XndJuFKSEmJ4elbLVkw3EIqJT68/aqEwPiN/FNrLe3N24o3geTa0QlRXh6jtYeFZOwVrXqzSa59KCEzJ3h2OkYef+YyO3XJ+lQ4fStmVX3DQiLxp+zmRo4zu3b0SX013pRkDFKKEE9KKOnoPZ6n9gzSEpLRSPLL3LsG6bYl6zgO7ImcdLk3VcjIlKxOB6X2OqnDSBcSmZbV6XhAqL0SMsCMQZoixFMoJR0PVtczLSE9T2z1kx9hVu21ZL1h5aBME0Lefr9iZV2VkCDI6yFneIqlpWR17ZUQGOlCIlNDSQmh9lQhlMZGoNSOWbIoDYmQWXuakJ7rBaRtbs9x77wPHpMQKlkfmuslRYjnahotJZ7j3VH79ISQ96to1/ctQ0hkKmgp8TC79iEhIxO2OjnEdBj5pP6tKQkLyZiwVUsXuXZsQr6V7vvUX/4JvJzQqFvaxHELqXT48PbLJaRkzKeWrBvwDHK3kErHGL39q4TA6L5P/c6thMxtDeoWyRnIhGQ1SU2GUYVckXE+I8owspDRvSLVFyFYITOhpsPoQqIpUU2H0YVYYJoVT+TP4IVcoZyGd0gIIX/3VjahLzCjsVNKJBJiCdOtkA5TEjKCigxTE6LU2ChSQiwgRU2inJDdkRTSO/Vq6TBVIT0oyjBlIaoNv0JWiA38ShsZaSE7Ii+kfumzmMoWQh6pUE+H7SLENpFhOwnZhRICo4TAKCEwSgiMEgLjD/+jU9tSSlO6AAAAAElFTkSuQmCC"