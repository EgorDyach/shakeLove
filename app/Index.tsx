import { Animated, Button, FlatList, Image, Modal, ScrollView, StatusBar, Text, TouchableWithoutFeedback, View } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { useNavigation } from "expo-router";
import { Gyroscope } from 'expo-sensors';
import { LinearGradient } from 'expo-linear-gradient';
import { opacity } from "react-native-reanimated/lib/typescript/reanimated2/Colors";
import { setDoc, doc, addDoc, collection, getDoc, getDocs, query, where, limit, orderBy, startAfter } from "firebase/firestore";
import { db } from './firebase';
import { Circle, Defs, G, Path, Stop, Svg } from "react-native-svg";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { Header } from "react-native/Libraries/NewAppScreen";

export default function Index() {
  const ROTATE_NUM = 9;
  const [activeId, setActiveId] = useState(1);
  const [activeData, setActiveData] = useState<any>({});
  const [last, setLast] = useState({});

  const [isButtonsDisabled, setIsButtonDisabled] = useState(false);
  const [pagination, setPagination] = useState({
    offset: 0,
    limit: 5
  })
  const [{ x, y, z }, setData] = useState({
    x: 0,
    y: 0,
    z: 0,
  });
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [visibleModal, setVisibleModal] = useState(false);

  const [forms, setForms] = useState<any[]>([]);
  useEffect(() => {
    setIsLoading(true);
    (async () => {
      const q = query(collection(db, "persons"), limit(pagination.limit));
      setPagination({ ...pagination, offset: pagination.offset + 5 })
      const querySnapshot = await getDocs(q);
      const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
      setLast(lastVisible);
      const newForms: React.SetStateAction<any[]> = [];
      querySnapshot.forEach((el) => {
        newForms.push({ ...el.data(), age: el.data().state, id: el.id });
      })
      setForms(newForms);
      setIsLoading(false);
      setActiveId(newForms[0].id)
      setActiveData(newForms[0])
    })();
  }, [])

  const _subscribe = () => {
    setSubscription(
      Gyroscope.addListener(gyroscopeData => {
        setData(gyroscopeData);
      })
    );
  };

  const _unsubscribe = () => {
    subscription && subscription.remove();
    setSubscription(null);
  };

  useEffect(() => {
    _subscribe();
    return () => _unsubscribe();
  }, []);

  const AnimOpacLeft = useRef(new Animated.Value(0)).current;
  const AnimOpacRight = useRef(new Animated.Value(0)).current;


  useEffect(() => Gyroscope.setUpdateInterval(16), [])

  useEffect(() => {
    const getMore = async () => {
      console.log(333);
      setIsLoading(true);
      const q = query(collection(db, "persons"), limit(pagination.limit), startAfter(last));
      setPagination({ ...pagination, offset: pagination.offset + 5 })
      const querySnapshot = await getDocs(q);
      const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
      setLast(lastVisible);
      const newForms: React.SetStateAction<any[]> = [];
      querySnapshot.forEach((el) => {
        newForms.push({ ...el.data(), age: el.data().state, id: el.id });
      })
      setForms([...newForms]);
      setIsLoading(false);
      setActiveId(newForms[0].id);
      setActiveData(newForms[0])
    };
    if (y > ROTATE_NUM && forms.length) {
      const cp = [...forms.filter(el => el.id !== activeId)];
      setForms(cp);
      setTimeout(() => {
      }, 1000)
      if (cp.length === 0) {
        getMore();
      } else {
        setActiveId(cp[0].id);
        setActiveData(cp[0]);
      }
      setIsButtonDisabled(true);
      _unsubscribe();
      setTimeout(() => {
        setIsButtonDisabled(false);
        _subscribe();
      }, 1000);


    } else if (y < -ROTATE_NUM && forms.length) {
      const cp = [...forms.filter(el => el.id !== activeId)];
      setForms(cp);
      setTimeout(() => {
      }, 1000)
      // console.log([...forms.filter(el => el.id !== activeId)]);
      if (cp.length === 0) {
        async function getMore() {
          setIsLoading(true);

          const q = query(collection(db, "persons"), limit(pagination.limit), startAfter(last));
          setPagination({ ...pagination, offset: pagination.offset + 5 })
          const querySnapshot = await getDocs(q);
          const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
          setLast(lastVisible);
          const newForms: React.SetStateAction<any[]> = [];
          querySnapshot.forEach((el) => {
            newForms.push({ ...el.data(), age: el.data().state, id: el.id });
          })
          setForms([...cp, ...newForms]);

          setIsLoading(false);
          setActiveId(newForms[0].id);
          setActiveData(newForms[0])
        };
        getMore()
      } else {
        setActiveId(cp[0].id);
        setActiveData(cp[0]);
      }
      setIsButtonDisabled(true);
      _unsubscribe();
      setTimeout(() => {
        _subscribe();
        setIsButtonDisabled(false);
      }, 1000);
    }
  }, [y])



  useEffect(() => {
    setData({ x: 0, y: 0, z: 0 });
  }, [activeId]);



  return (
    <ScrollView
      style={{
        marginTop: 40,
        marginBottom: 25,
        paddingTop: (StatusBar.currentHeight ? StatusBar?.currentHeight + 20 : 20),
      }}
    >
      <Image style={{ marginLeft: "auto", marginRight: "auto", marginBottom: 40, marginTop: 20 }} source={require('../assets/images/Logo.png')} width={100} height={60} />
      <View style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}>
        <Animated.View style={{
          position: "absolute",
          top: -1000,
          left: 0,
          width: 40,
          bottom: -1000,
          backgroundColor: "blue",
          opacity: AnimOpacLeft,
        }} />
        <Animated.View style={{

          position: "absolute",
          top: -1000,
          right: 0,
          width: 40,
          bottom: -1000,
          backgroundColor: "red",
          opacity: AnimOpacRight,

          // opacity: 1
        }} />

        {isLoading && <View>
          <Text style={{
            color: "#333",
            fontSize: 32,
            textAlign: "center"
          }}>Загрузка...</Text>
        </View>}
        {!isLoading && forms.length !== 0 && activeData && <View key={activeData.id} style={{
          width: 265,
          height: 375,

          transform: [
            {
              rotate: (Math.abs(y) > 1.5 ? `${(y > 0 ? y - 1.5 : y + 1.5) * 1.6}deg` : `0deg`),
            }
          ],
          display: (activeData.id === activeId ? "flex" : "none"),
          justifyContent: "flex-end"
        }}>
          <LinearGradient style={{
            zIndex: 5,
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 200
          }} colors={activeData.gender === "G" ? ["transparent", "rgba(255, 0, 166, 0.75)"] : ["transparent", "rgba(18, 0, 255, 0.75)"]} locations={[.1, .7]} >
          </LinearGradient>
          <Text style={{
            zIndex: 9,
            padding: 10,
            fontFamily: "Roboto",
            fontSize: 28,
            color: "#FFF"
          }}>{activeData && activeData.name && activeData.name[0].toUpperCase() + activeData.name.slice(1)}{activeData.age && `, ${activeData.age}`}</Text>
          {/* <Text>{activeData.age}</Text> */}
          {/* {activeData.interests.map(interest => <Text key={activeData.interests.indexOf(interest)}>{interest}</Text>)} */}
          {/* <Text>{activeData.about}</Text> */}
          <Image style={{ position: "absolute", borderTopLeftRadius: 10, borderTopRightRadius: 10, borderBottomLeftRadius: 10, borderBottomRightRadius: 10, width: "100%", height: "100%", zIndex: -1 }} source={{ uri: activeData.img }} />
        </View>}

      </View>
      <View style={{
        display: (!isLoading && forms.length ? "flex" : "none"),
        marginTop: 60,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
      }}>
        <Svg onPress={() => {
          if (!isButtonsDisabled) {
            setData({ x: 0, z: 0, y: 20 })
          }
        }} width="62" height="62" viewBox="0 0 62 62" fill="none">
          <G filter="url(#filter0_d_0_1)">
            <Circle cx="31" cy="31" r="25" fill="white" />
          </G>
          <Path d="M32.8209 30.4992L38.7229 24.606C38.8993 24.4295 38.9984 24.1903 38.9984 23.9408C38.9984 23.6913 38.8993 23.452 38.7229 23.2755C38.5465 23.0991 38.3072 23 38.0577 23C37.8083 23 37.569 23.0991 37.3926 23.2755L31.5 29.1781L25.6074 23.2755C25.431 23.0991 25.1917 23 24.9423 23C24.6928 23 24.4535 23.0991 24.2771 23.2755C24.1007 23.452 24.0016 23.6913 24.0016 23.9408C24.0016 24.1903 24.1007 24.4295 24.2771 24.606L30.1791 30.4992L24.2771 36.3924C24.1893 36.4795 24.1196 36.5832 24.072 36.6973C24.0245 36.8115 24 36.934 24 37.0576C24 37.1813 24.0245 37.3038 24.072 37.418C24.1196 37.5321 24.1893 37.6358 24.2771 37.7229C24.3642 37.8107 24.4678 37.8804 24.582 37.9279C24.6961 37.9755 24.8186 38 24.9423 38C25.0659 38 25.1884 37.9755 25.3025 37.9279C25.4167 37.8804 25.5203 37.8107 25.6074 37.7229L31.5 31.8203L37.3926 37.7229C37.4797 37.8107 37.5833 37.8804 37.6975 37.9279C37.8116 37.9755 37.9341 38 38.0577 38C38.1814 38 38.3039 37.9755 38.418 37.9279C38.5322 37.8804 38.6358 37.8107 38.7229 37.7229C38.8107 37.6358 38.8804 37.5321 38.928 37.418C38.9755 37.3038 39 37.1813 39 37.0576C39 36.934 38.9755 36.8115 38.928 36.6973C38.8804 36.5832 38.8107 36.4795 38.7229 36.3924L32.8209 30.4992Z" fill="black" />
          <Defs>
          </Defs>
        </Svg>
        <Svg onPress={() => {
          if (!isButtonsDisabled) {
            setVisibleModal(true);
          }
        }} width="72" height="72" viewBox="0 0 72 72" fill="none">
          <G filter="url(#filter0_d_0_1)">
            <Circle cx="36" cy="36" r="30" fill="white" />
          </G>
          <Path d="M40.1418 36.3867C41.3733 35.423 42.2722 34.1016 42.7135 32.6063C43.1547 31.1109 43.1163 29.5159 42.6036 28.0433C42.0909 26.5706 41.1294 25.2935 39.8529 24.3896C38.5764 23.4857 37.0484 23 35.4814 23C33.9144 23 32.3863 23.4857 31.1098 24.3896C29.8333 25.2935 28.8718 26.5706 28.3591 28.0433C27.8465 29.5159 27.8081 31.1109 28.2493 32.6063C28.6905 34.1016 29.5894 35.423 30.821 36.3867C28.7107 37.2275 26.8694 38.622 25.4934 40.4217C24.1174 42.2214 23.2583 44.3587 23.0076 46.6058C22.9894 46.7698 23.004 46.9358 23.0503 47.0943C23.0967 47.2528 23.174 47.4006 23.2778 47.5294C23.4875 47.7894 23.7924 47.956 24.1256 47.9925C24.4587 48.0289 24.7928 47.9322 25.0543 47.7237C25.3158 47.5152 25.4833 47.2119 25.5199 46.8806C25.7958 44.4385 26.9666 42.1831 28.8089 40.5452C30.6511 38.9074 33.0355 38.002 35.5065 38.002C37.9775 38.002 40.3619 38.9074 42.2041 40.5452C44.0463 42.1831 45.2172 44.4385 45.4931 46.8806C45.5272 47.1876 45.6745 47.4711 45.9065 47.6764C46.1385 47.8817 46.4387 47.9943 46.7492 47.9925H46.8874C47.2167 47.9548 47.5177 47.7892 47.7247 47.5318C47.9318 47.2744 48.0282 46.946 47.9928 46.6182C47.741 44.3648 46.8772 42.222 45.4941 40.4196C44.1111 38.6171 42.2608 37.223 40.1418 36.3867ZM35.4814 35.4997C34.4876 35.4997 33.5161 35.2066 32.6898 34.6575C31.8635 34.1084 31.2195 33.328 30.8392 32.4149C30.4589 31.5018 30.3593 30.497 30.5532 29.5277C30.7471 28.5583 31.2257 27.6679 31.9284 26.969C32.6311 26.2702 33.5264 25.7943 34.5011 25.6014C35.4758 25.4086 36.4861 25.5076 37.4042 25.8858C38.3224 26.264 39.1071 26.9045 39.6592 27.7263C40.2114 28.5481 40.5061 29.5142 40.5061 30.5025C40.5061 31.8279 39.9767 33.0989 39.0344 34.036C38.092 34.9732 36.814 35.4997 35.4814 35.4997Z" fill="#8B1CF9" />
        </Svg>

        <Svg onPress={() => {
          if (!isButtonsDisabled) {
            setData({ x: 0, z: 0, y: 20 })
          }
        }} width="62" height="62" viewBox="0 0 62 62" fill="none">
          <G filter="url(#filter0_d_0_1)">
            <Circle cx="31" cy="31" r="25" fill="white" />
          </G>
          <Path d="M24 40H36.73C37.4318 39.9998 38.1113 39.7535 38.6503 39.304C39.1893 38.8546 39.5537 38.2303 39.68 37.54L40.95 30.54C41.0291 30.1076 41.0122 29.663 40.9006 29.2378C40.7889 28.8126 40.5851 28.4172 40.3037 28.0794C40.0222 27.7417 39.67 27.47 39.2719 27.2834C38.8738 27.0969 38.4396 27.0001 38 27H33.44L34 25.57C34.2329 24.9439 34.3105 24.2706 34.2261 23.6079C34.1416 22.9452 33.8977 22.3129 33.5152 21.7652C33.1327 21.2175 32.623 20.7708 32.0299 20.4633C31.4368 20.1559 30.778 19.9969 30.11 20C29.9176 20.0004 29.7295 20.0563 29.5681 20.1609C29.4067 20.2656 29.2789 20.4146 29.2 20.59L26.35 27H24C23.2043 27 22.4413 27.3161 21.8787 27.8787C21.3161 28.4413 21 29.2044 21 30V37C21 37.7956 21.3161 38.5587 21.8787 39.1213C22.4413 39.6839 23.2043 40 24 40ZM28 28.21L30.72 22.09C30.9983 22.1742 31.2564 22.3145 31.4785 22.5022C31.7005 22.69 31.8817 22.9212 32.011 23.1817C32.1403 23.4421 32.2149 23.7263 32.2302 24.0166C32.2455 24.307 32.2012 24.5974 32.1 24.87L31.57 26.3C31.4571 26.6023 31.4189 26.9273 31.4589 27.2475C31.4988 27.5677 31.6156 27.8735 31.7993 28.1387C31.983 28.404 32.2282 28.6209 32.5139 28.7708C32.7996 28.9208 33.1173 28.9994 33.44 29H38C38.1469 28.9998 38.2921 29.0319 38.4251 29.0941C38.5582 29.1563 38.676 29.2471 38.77 29.36C38.8663 29.4713 38.9369 29.6025 38.9766 29.7443C39.0164 29.886 39.0244 30.0348 39 30.18L37.73 37.18C37.6874 37.413 37.5635 37.6232 37.3804 37.7734C37.1973 37.9236 36.9668 38.0039 36.73 38H28V28.21ZM23 30C23 29.7348 23.1053 29.4804 23.2929 29.2929C23.4804 29.1054 23.7348 29 24 29H26V38H24C23.7348 38 23.4804 37.8946 23.2929 37.7071C23.1053 37.5196 23 37.2652 23 37V30Z" fill="black" />
        </Svg>

      </View>
      {!isLoading && !forms.length && <View>
        <Text style={{
          color: "#333",
          fontSize: 32,
          textAlign: "center"
        }}>К сожалению, все подходящие анкеты закончились, но вы обязательно возвращайтесь за новыми знакомствами!</Text>
      </View>}
      <Modal visible={visibleModal} transparent={true} style={{ padding: 60, backgroundColor: "transparent", height: 500, margin: 0 }}>
        <ParallaxScrollView
          headerBackgroundColor={{ dark: "#fff", light: "#fff" }}
          headerImage={<Image source={{ uri: activeData.img }} height={400} />}
        >
          <View style={{
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: "flex-start",
          }}>
            <Svg onPress={() => setVisibleModal(false)} width="45" height="45" viewBox="0 0 25 25" fill="none" style={{
              position: "absolute",
              right: 10,
              top: 10,
            }}>
              <Path d="M8.82092 7.4992L14.7229 1.60597C14.8993 1.42954 14.9984 1.19026 14.9984 0.940755C14.9984 0.691251 14.8993 0.451966 14.7229 0.275541C14.5465 0.099115 14.3072 0 14.0577 0C13.8083 0 13.569 0.099115 13.3926 0.275541L7.5 6.17814L1.6074 0.275541C1.43099 0.099115 1.19173 2.2152e-07 0.942253 2.23379e-07C0.692776 2.25238e-07 0.453517 0.099115 0.27711 0.275541C0.100703 0.451966 0.001599 0.691251 0.001599 0.940755C0.001599 1.19026 0.100703 1.42954 0.27711 1.60597L6.17908 7.4992L0.27711 13.3924C0.189303 13.4795 0.119609 13.5832 0.0720482 13.6973C0.0244871 13.8115 0 13.934 0 14.0576C0 14.1813 0.0244871 14.3038 0.0720482 14.418C0.119609 14.5321 0.189303 14.6358 0.27711 14.7229C0.3642 14.8107 0.467813 14.8804 0.581973 14.9279C0.696134 14.9755 0.818582 15 0.942253 15C1.06592 15 1.18837 14.9755 1.30253 14.9279C1.41669 14.8804 1.52031 14.8107 1.6074 14.7229L7.5 8.82026L13.3926 14.7229C13.4797 14.8107 13.5833 14.8804 13.6975 14.9279C13.8116 14.9755 13.9341 15 14.0577 15C14.1814 15 14.3039 14.9755 14.418 14.9279C14.5322 14.8804 14.6358 14.8107 14.7229 14.7229C14.8107 14.6358 14.8804 14.5321 14.928 14.418C14.9755 14.3038 15 14.1813 15 14.0576C15 13.934 14.9755 13.8115 14.928 13.6973C14.8804 13.5832 14.8107 13.4795 14.7229 13.3924L8.82092 7.4992Z" fill="black" />

            </Svg>
            <Text style={{
              zIndex: 9,
              padding: 10,
              fontFamily: "Roboto",
              fontSize: 32,
              fontWeight: 600,
              color: "#8B1CF9"
            }}>{activeData && activeData.name && activeData.name[0].toUpperCase() + activeData.name.slice(1)}{activeData.age && `, ${activeData.age}`}</Text>
            <Text style={{
              zIndex: 9,
              padding: 10,
              fontFamily: "Roboto",
              fontSize: 24,
              fontWeight: 500,
              color: "black"
            }}>Описание</Text>
            <Text style={{
              zIndex: 9,
              padding: 10,
              paddingTop: 3,
              fontFamily: "Roboto",
              fontSize: 14,
              fontWeight: 400,
              color: "black"
            }}>{activeData.about}</Text>
            <Text style={{
              zIndex: 9,
              padding: 10,
              fontFamily: "Roboto",
              fontSize: 24,
              fontWeight: 500,
              color: "black"
            }}>Интересы</Text>
            <View style={{ display: "flex", padding: 10, flexWrap: "wrap", flexDirection: "row", gap: 10 }}>
              {activeData.interests && activeData.interests.map((el: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined) => {
                return <Text key={Math.round(Math.random() * 1000000)} style={{ padding: 10, backgroundColor: "#8B1CF9", color: "#fff" }}>{el}</Text>
              })}
            </View>
          </View>
        </ParallaxScrollView>

      </Modal>
    </ScrollView >
  );
}
