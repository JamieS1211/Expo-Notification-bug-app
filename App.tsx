import {
    AndroidImportance,
    Notification,
    addNotificationReceivedListener,
    addNotificationResponseReceivedListener,
    getDevicePushTokenAsync,
    getExpoPushTokenAsync,
    getPermissionsAsync,
    removeNotificationSubscription,
    requestPermissionsAsync,
    setNotificationChannelAsync,
    setNotificationHandler
} from "expo-notifications"
import { Platform, Text, View } from "react-native"
import React, { useEffect, useRef, useState } from "react"

import Constants from "expo-constants"
import { Subscription } from "@unimodules/core"

// Set behavior for incoming notifications when app in foreground
setNotificationHandler({
    // eslint-disable-next-line @typescript-eslint/require-await
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false
    })
})

const App = () => {
    const [expoPushToken, setExpoPushToken] = useState<string>()
    const [devicePushToken, setDevicePushToken] = useState<string>()
    const notificationListener = useRef<Subscription>()
    const responseListener = useRef<Subscription>()

    useEffect(() => {
        const registerForPushNotifications = async () => {
            try {
                if (Constants.isDevice) {
                    // Android remote notification permissions are granted during the app install, so this will only ask on iOS
                    // Only ask if permissions have not already been determined - iOS won't necessarily prompt the user a second time
                    if ((await getPermissionsAsync()).granted || (await requestPermissionsAsync()).granted) {
                        // Get the token that uniquely identifies this device
                        setExpoPushToken((await getExpoPushTokenAsync()).data)
                        setDevicePushToken((await getDevicePushTokenAsync()).data)
                    }
                }

                if (Platform.OS === "android") {
                    setNotificationChannelAsync("default", {
                        name: "default",
                        importance: AndroidImportance.MAX,
                        vibrationPattern: [0, 250, 250, 250],
                        lightColor: "#FF231F7C"
                    })
                }
            } catch (error) {
                if (Constants.manifest.releaseChannel !== "production") {
                    alert(JSON.stringify(error))
                }
            }
        }

        registerForPushNotifications()

        notificationListener.current = addNotificationReceivedListener((incomingNotification) => {
            // Notification received when in foreground
            alert(`Notification received!\n\n${JSON.stringify(incomingNotification)}`)
        })

        responseListener.current = addNotificationResponseReceivedListener((notificationResponse) => {
            // Notification when clicked from notification center
            alert(`Notification touched!\n\n${JSON.stringify(notificationResponse)}`)
        })

        return () => {
            if (notificationListener.current) {
                removeNotificationSubscription(notificationListener.current)
            }

            if (responseListener.current) {
                removeNotificationSubscription(responseListener.current)
            }
        }
    }, [])

    return (
        <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
            <Text selectable style={{ paddingBottom: 20, fontSize: 18 }}>{`ExpoPushToken:\n${expoPushToken}`}</Text>
            <Text selectable style={{ fontSize: 18 }}>{`DevicePushToken:\n ${devicePushToken}`}</Text>
        </View>
    )
}

export default App
