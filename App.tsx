import * as React from "react";
import {
  View,
  SafeAreaView,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  Pressable,
  Image,
  useColorScheme,
  Alert,
  ActivityIndicator
} from "react-native";
import { NavigationContainer, useRoute } from "@react-navigation/native";
import { useIsFocused } from "@react-navigation/native";

import { WebView } from "react-native-webview";
import axios from "axios";
import Ionicons from "@expo/vector-icons/Ionicons";

const baseUrl = "https://ruya.caserver.org/";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Colors } from "react-native/Libraries/NewAppScreen";
interface ItemIT {
  rid?: string | number;
  title?: string;
  content?: string;
}
type ListIT = Array<ItemIT>;
const Stack = createNativeStackNavigator();

export default function App(this: any) {
  let cmode = useColorScheme();
  let bgColor = cmode === "dark" ? "#25233a" : "#FFFFFF";
  let ibgColor = cmode === "dark" ? "#383358" : "#E3E7EB";
  let brdColor = cmode === "dark" ? "#383358" : "#BCC3CB";
  let texColor = cmode === "dark" ? "#e0dee7" : "#7C828F";

  const [rlist, setRlist] = React.useState<ListIT>([]);
  let [loader, setLoader] = React.useState(false);
  let [detailTitle, setDetailTitle] = React.useState("-");

  function HomeScreen({ navigation }: { navigation: any }) {
    return (
      <SafeAreaView style={[styles.rootcont, { backgroundColor: bgColor }]}>
        <View style={styles.logocont}>
          <Image style={styles.logo} source={require("./assets/icon.png")} />
          <Text style={[styles.logotext, { color: texColor }]}>
            Rüyadan Rüya Yorumları
          </Text>
        </View>
        <Pressable onPress={() => navigation.navigate("SearchList")}>
          <Text
            style={[
              styles.fakeinput,
              {
                color: texColor,
                backgroundColor: bgColor,
                borderColor: brdColor,
              },
            ]}
          >
            Buraya yazın...
          </Text>
        </Pressable>
        <Pressable
            style={[
              styles.bagiscard,
              {
                backgroundColor: ibgColor,
                borderColor: brdColor,
              },
            ]}
           onPress={() => navigation.navigate("Bagis")}>
            <Ionicons name="heart" style={[{
                color: texColor
              },
            ]} size={20}></Ionicons>
          <Text style={[{
                color: texColor,
                marginLeft: 10
              },
            ]}>
            Bağış Yapın
          </Text>
        </Pressable>
      </SafeAreaView>
    );
  }
  const mainsearchinput: React.RefObject<TextInput> = React.createRef();
  function SearchScreen({ navigation }: { navigation: any }) {
    return (
      <SafeAreaView style={[styles.rootcont, { backgroundColor: bgColor }]}>
           {loader ? <ActivityIndicator></ActivityIndicator> : ""}
  
          {!loader && searchQuery.length > 0 && rlist.length < 1 && (
            <View style={styles.notfoundCont}>
              <Ionicons style={[styles.notfound]} name="warning-outline" size={75} color={texColor} />
              <Text style={[styles.notfound, { color: texColor }]}>Sonuç bulunamadı!</Text>
              </View>
           
          )}

        <FlatList
          data={rlist}
          renderItem={({ item }) => (
              <Pressable
                onPress={() =>
                  navigation.navigate("Detail", {
                    rid: item.rid || "",
                  })
                }
              >
                <Text
                  style={[
                    styles.listli,
                    { color: texColor, borderBottomColor: brdColor },
                  ]}
                >
                  {item.title || ""}
                </Text>
              </Pressable>
          )}
          keyExtractor={(item) => `ruya${item.rid}`}
        />
      </SafeAreaView>
    );
  }
  function DetailScreen() {
    let [content, setContent] = React.useState("");
    type routeTy = {
      params?: {
        rid?: any;
      };
    };
    const route: routeTy = useRoute();

    const rid = route.params?.rid || 0;
    async function getDream() {
      await axios<ItemIT>({
        method: "get",
        url: `${baseUrl}?t=show&id=${rid}`,
      })
        .then((res) => {
          const style = `<style>
          .container {
            padding:0.5rem 2rem 1rem 2rem;
            font-size: 44px;
            background-color: ${bgColor};
            color: ${texColor}
          }
          .container ul li {
            font-weight: 700;
          }
          </style>`;

          setContent(
            `${style}<div class="container">${res.data.content}</div>`
          );
          setDetailTitle(res?.data?.title || "");
        })
        .catch((err) => {
          Alert.alert('Hata', 'Rüya alınırken sorun oluştu!', [
            {text: 'TAMAM'},
          ]);
        });
    }
    React.useEffect(() => {
      if (rid) {
        getDream();
      }
    }, []);
    return <WebView originWhitelist={["*"]} style={[{backgroundColor: bgColor }]} source={{ html: content }} />;
  }
  function BagisScreen() {
    let [bagis, setBagis] = React.useState("");
    async function getPage() {
      await axios<string>("http://monolabdevs.com/api/bagis/")
        .then((res) => {
          const style = `<style>
          .container {
            padding:0.5rem 2rem 1rem 2rem;
            font-size: 44px;
            background-color: ${bgColor};
            color: ${texColor}
          }
          .container ul li {
            font-weight: 700;
          }
          </style>`;

          setBagis(
            `${style}<div class="container">${res.data}</div>`
          );
     
          setDetailTitle("");
        })
        .catch((err) => {
          Alert.alert('Hata', 'Rüya alınırken sorun oluştu!', [
            {text: 'TAMAM'},
          ]);
        });
    }
    React.useEffect(() => {
      getPage();
    }, []);
    return <WebView originWhitelist={["*"]} style={[{backgroundColor: bgColor }]} source={{ html: bagis }} />;
  }
  let [searchQuery, onChangeSearchQuery] = React.useState("");
  let [requestTimer, setRequestTimer] = React.useState(0);
  async function searchDream() {
    if (searchQuery.length < 1) {
      return;
    }
    setLoader(true);
    await axios<ListIT>({
      method: "get",
      url: `${baseUrl}?t=search&q=${searchQuery}`,
    })
      .then((res) => {
        setRlist(res.data);
      })
      .catch((err) => {
        Alert.alert('Hata', 'Rüya aranırken sorun oluştu!', [
          {text: 'TAMAM'},
        ]);
      })
      .finally(()=>{
        setLoader(false);
      });
  }

  React.useEffect(() => {
    if (searchQuery.length < 1) {
      setRlist([]);
    } else {
      searchDream();
      setRequestTimer(3000);
    }
  }, [searchQuery]);

  React.useEffect(() => {
    if (requestTimer === 0) {
      searchDream();
    } else {
      setRlist([]);
    }
    if (requestTimer > 0) {
      this.setTimeout(() => {
        setRequestTimer(0);
      }, requestTimer);
    }
  }, [requestTimer]);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          options={{
            headerShown: false,
          }}
          name="Home"
          component={HomeScreen}
        />
        <Stack.Screen
          name={"SearchList"}
          options={{
            headerTintColor: texColor,
            headerStyle: {
              backgroundColor: ibgColor,
            },
            headerRight: () => (
              <Pressable
                onPress={() => {
                  onChangeSearchQuery("");
                }}
              >
                <Text
                  style={searchQuery.length > 0 ? styles.clearbtn : styles.none}
                >
                  {" "}
                  <Ionicons
                    color={texColor}
                    name="close"
                    size={24}
                  ></Ionicons>{" "}
                </Text>
              </Pressable>
            ),
            headerTitle: () => (
              <TextInput
                style={[
                  styles.input,
                  {
                    color: texColor,
                    backgroundColor: bgColor,
                    borderColor: brdColor,
                  },
                ]}
                onChangeText={onChangeSearchQuery}
                placeholderTextColor={texColor}
                autoFocus={true}
                value={searchQuery}
                placeholder="Rüyada ..."
              />
            ),
          }}
          component={SearchScreen}
        />
        <Stack.Screen
          name={"Bagis"}
          options={{
            headerTintColor: texColor,
            headerStyle: {
              backgroundColor: ibgColor,
            },
            headerTitle: "Bağış Yapın",
          }}
          component={BagisScreen}
        />
        <Stack.Screen
          name={"Detail"}
          options={{
            headerTintColor: texColor,
            headerStyle: {
              backgroundColor: ibgColor,
            },
            headerTitle: () => (
              <Text style={[styles.detailtitle, { color: texColor }]}>
                {detailTitle}
              </Text>
            ),
          }}
          component={DetailScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  rootcont: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  detailtitle: {
    fontSize: 12,
  },

 notfoundCont: {
 paddingTop: 100
  },
  bagiscard: {
padding: 20,
borderRadius: 10,
marginTop: 20,
flexDirection: "row",
textAlign: "center"
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: "contain",
    marginLeft: "auto",
    marginRight: "auto",
  },
  logocont: {
    marginBottom: 10,
    paddingBottom: 10,
    textAlign: "center",
  },
  logotext: {},
  input: {
    flex: 1,
    paddingStart: 20,
    paddingEnd: 20,
    paddingBottom: 10,
    paddingTop: 10,
    marginEnd: 80,
    marginStart: -20,
    borderRadius: 50,
  },

  fakeinput: {
    padding: 20,
    borderWidth: 1,
    borderRadius: 50,
    width: 1000,
    maxWidth: "90%",
  },
  listli: {
    paddingBottom: 15,
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 15,
    fontSize: 16,
    borderBottomWidth: 1,
    width: "100%"
  },
  clearbtn: {},
  notfound: {
    textAlign: "center"
  },
  none: {
    opacity: 0,
  },
});
