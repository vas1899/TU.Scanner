import useCachedResources from "./hooks/useCachedResources";
import useColorScheme from "./hooks/useColorScheme";
import { BarCodeScanner } from "expo-barcode-scanner";
import React, { useEffect, useState } from "react";
import { Text, View, StyleSheet, Button } from "react-native";
import agent from "./src/api/agent";

export default function App() {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();
  const [ids, setIds] = useState<string[]>([]);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [hasScannedIds, setHasScannedIds] = useState(false);
  const [text, setText] = useState("Not yet scanned");

  const askForCameraPermission = () => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  };

  // Request Camera Permission
  useEffect(() => {
    askForCameraPermission();
  }, []);

  interface Props {
    type: string;
    data: string;
  }
  // When we scan the bar code
  const handleBarCodeScanned = ({ type, data }: Props) => {
    setScanned(true);
    setHasScannedIds(true);
    if (!ids.includes(data)) {
      setIds([...ids, data]);
      setText(data);
    } else {
      setText("Already scanned: " + data);
    }

    console.log("Type: " + type + "\nData: " + data);
    console.log(ids);
  };

  const hadleSubmit = async () => {
    // for testing
    // setIds([...ids, "717952d5-c3eb-4eeb-9cd6-c85e4d3958ce"]);

    ids.map(async (id) => {
      const response = await agent.Packets.update(id);
      console.log(response);
    });
    setHasScannedIds(false);
  };

  // Check permissions and return the coresponding screens
  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Requesting for camera permission</Text>
      </View>
    );
  }
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={{ margin: 10 }}>No access to camera</Text>
        <Button title={"Allow Camera"} onPress={() => askForCameraPermission()} />
      </View>
    );
  }

  // Return the View
  return (
    <View style={styles.container}>
      <View style={styles.barcodebox}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={{ height: 400, width: 400 }}
        />
      </View>
      <Text style={styles.maintext}>{text}</Text>

      {scanned && <Button title={"Scan again?"} onPress={() => setScanned(false)} color="tomato" />}
      <span style={{ marginTop: "7rem" }}>
        {hasScannedIds && <Button title={"Send"} onPress={() => hadleSubmit()} color="blue" />}
      </span>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  maintext: {
    fontSize: 16,
    margin: 20,
  },
  barcodebox: {
    alignItems: "center",
    justifyContent: "center",
    height: 300,
    width: 300,
    overflow: "hidden",
    borderRadius: 30,
    backgroundColor: "tomato",
  },
});
