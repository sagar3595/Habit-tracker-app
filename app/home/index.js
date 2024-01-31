import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Image,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import axios from "axios";
import {
  BottomModal,
  ModalContent,
  ModalTitle,
  SlideAnimation,
} from "react-native-modals";
import { useFocusEffect } from "@react-navigation/native";

const index = () => {
  const [option, setOption] = useState("Today");
  const router = useRouter();
  const [habits, setHabits] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState("");
  const currentDay = new Date()
    .toLocaleDateString("en-US", { weekday: "short" })
    .slice(0, 3);
  console.log(currentDay);

  useEffect(() => {
    fetchHabits();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchHabits();
    }, [])
  );

  const fetchHabits = async () => {
    try {
      const response = await axios.get("http://192.168.1.7:3000/habitslist");
      setHabits(response.data);
    } catch (error) {
      console.log("error fetching habits", error);
    }
  };
  const handleLongPress = (habitId) => {
    const selectedHabit = habits?.find((habit) => habit._id == habitId);
    setSelectedHabit(selectedHabit);
    setIsModalVisible(true);
  };
  const handleCompletion = async () => {
    try {
      const habitId = selectedHabit?._id;
      const updatedCompletion = {
        ...selectedHabit?.completed,
        [currentDay]: true,
      };
      await axios.put(`http://192.168.1.7:3000/habits/${habitId}/completed`, {
        completed: updatedCompletion,
      });

      await fetchHabits();
      setIsModalVisible(false);
    } catch (error) {
      console.log("error", error);
    }
  };

  const filteredHabits = habits?.filter((habit) => {
    return !habit.completed || !habit.completed[currentDay];
  });
  console.log("filtered habits", habits);
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const deleteHabit = async () => {
    try {
      const habitId = selectedHabit._id;
      const response = await axios.delete(
        `http://192.168.1.7:3000/habits/${habitId}`
      );

      if (response.status == 200) {
        setHabits(response.data);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const getCompletedDays = (completedObj) => {
    if(completedObj && typeof completedObj === "object"){
      return Object.keys(completedObj).filter((day) => completedObj[day]);
    }
    return [];
  }
  return (
    <>
      <ScrollView style={{ flex: 1, backgroundColor: "white", padding: 10 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Ionicons name="logo-foursquare" size={27} color="black" />
          <AntDesign
            onPress={() => router.push("/home/create")}
            name="plus"
            size={24}
            color="black"
          />
        </View>

        <Text style={{ marginTop: 5, fontSize: 23, fontWeight: "500" }}>
          Habits
        </Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            marginVertical: 8,
          }}
        >
          <Pressable
            onPress={() => setOption("Today")}
            style={{
              backgroundColor: option == "Today" ? "#E0FFFF" : "transparent",
              paddingHorizontal: 10,
              paddingVertical: 8,
              borderRadius: 25,
            }}
          >
            <Text style={{ textAlign: "center", color: "gray", fontSize: 14 }}>
              Today
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setOption("Weekly")}
            style={{
              backgroundColor: option == "Weekly" ? "#E0FFFF" : "transparent",
              paddingHorizontal: 10,
              paddingVertical: 8,
              borderRadius: 25,
            }}
          >
            <Text style={{ textAlign: "center", color: "gray", fontSize: 14 }}>
              Weekly
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setOption("Overall")}
            style={{
              backgroundColor: option == "Overall" ? "#E0FFFF" : "transparent",
              paddingHorizontal: 10,
              paddingVertical: 8,
              borderRadius: 25,
            }}
          >
            <Text style={{ textAlign: "center", color: "gray", fontSize: 14 }}>
              Overall
            </Text>
          </Pressable>
        </View>

        {option == "Today" &&
          (filteredHabits?.length > 0 ? (
            <View>
              {filteredHabits?.map((item, index) => (
                <Pressable
                  onLongPress={() => handleLongPress(item._id)}
                  style={{
                    marginVertical: 10,
                    backgroundColor: item?.color,
                    padding: 12,
                    borderRadius: 24,
                  }}
                >
                  <Text
                    style={{
                      textAlign: "center",
                      fontWeight: "500",
                      color: "white",
                    }}
                  >
                    {item?.title}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : (
            <View
              style={{
                marginTop: 150,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: "auto",
              }}
            >
              <Image
                style={{ width: 60, height: 60, resizeMode: "cover" }}
                source={{
                  uri: "https://cdn-icons-png.flaticon.com/128/10609/10609386.png",
                }}
              />

              <Text
                style={{
                  textAlign: "center",
                  fontSize: 20,
                  fontWeight: "600",
                  marginTop: 10,
                }}
              >
                No habits for today
              </Text>

              <Text
                style={{
                  textAlign: "center",
                  fontSize: 20,
                  fontWeight: "600",
                  marginTop: 10,
                }}
              >
                No habits for today.Create one?
              </Text>

              <Pressable
                onPress={() => router.push("/home/create")}
                style={{
                  backgroundColor: "#0071c5",
                  marginTop: 20,
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              >
                <Text>Create</Text>
              </Pressable>
            </View>
          ))}
        {option == "Weekly" && (
          <View>
            {habits?.map((habit, index) => (
              <Pressable
                style={{
                  marginVertical: 10,
                  backgroundColor: habit.color,
                  padding: 15,
                  borderRadius: 24,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Text
                    style={{ fontSize: 15, fontWeight: "500", color: "white" }}
                  >
                    {habit.title}
                  </Text>
                  <Text style={{ color: "white" }}>{habit.repeatMode}</Text>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-evenly",
                    marginVertical: 10,
                  }}
                >
                  {days?.map((day, item) => {
                    const isCompleted = habit.completed && habit.completed[day];
                    return (
                      <Pressable>
                        <Text
                          style={{
                            color: day === currentDay ? "red" : "white",
                          }}
                        >
                          {day}
                        </Text>

                        {isCompleted ? (
                          <FontAwesome
                            name="circle"
                            size={24}
                            color="black"
                            style={{ marginTop: 12 }}
                          />
                        ) : (
                          <Feather
                            name="circle"
                            size={24}
                            color="white"
                            style={{ marginTop: 12 }}
                          />
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {option === "Overall" && (
          <View>
            {habits?.map((habit, index) => (
              <>
                <Pressable
                  style={{
                    marginVertical: 10,
                    backgroundColor: habit.color,
                    padding: 15,
                    borderRadius: 24,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: "500",
                        color: "white",
                      }}
                    >
                      {habit.title}
                    </Text>
                    <Text style={{ color: "white" }}>{habit.repeatMode}</Text>
                  </View>
                </Pressable>

                <View style={{flexDirection:"row", alignItems:"center",justifyContent:"space-between"}}>
                  <Text>Completed on</Text>
                  <Text>{getCompletedDays(habit.completed).join(", ")}</Text>

                </View>
              </>
            ))}
          </View>
        )}
      </ScrollView>

      <BottomModal
        onBackdropPress={() => setIsModalVisible(!isModalVisible)}
        onHardwareBackPress={() => setIsModalVisible(!isModalVisible)}
        swipeDirection={["up", "down"]}
        swipeThreshold={200}
        modalTitle={<ModalTitle title="Choose Option" />}
        modalAnimation={
          new SlideAnimation({
            slideFrom: "bottom",
          })
        }
        visible={isModalVisible}
        onTouchOutside={() => setIsModalVisible(!isModalVisible)}
      >
        <ModalContent style={{ width: "100%", height: 220 }}>
          <View style={{ marginVertical: 10 }}>
            <Text>Options</Text>
            <Pressable
              onPress={handleCompletion}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                marginTop: 10,
              }}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={24}
                color="black"
              />
              <Text>Completed</Text>
            </Pressable>

            <Pressable
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                marginTop: 10,
              }}
            >
              <Feather name="skip-forward" size={24} color="black" />
              <Text>Skip</Text>
            </Pressable>

            <Pressable
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                marginTop: 10,
              }}
            >
              <Feather name="edit" size={24} color="black" />
              <Text>Edit</Text>
            </Pressable>

            <Pressable
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                marginTop: 10,
              }}
            >
              <Ionicons name="archive-outline" size={24} color="black" />
              <Text>Archive</Text>
            </Pressable>

            <Pressable
              onPress={deleteHabit}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                marginTop: 10,
              }}
            >
              <AntDesign name="delete" size={24} color="black" />
              <Text>Delete</Text>
            </Pressable>
          </View>
        </ModalContent>
      </BottomModal>
    </>
  );
};

export default index;

const styles = StyleSheet.create({});
