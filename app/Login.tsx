import Logo from '@/components/Logo'
import React from 'react'
import { Button, Text, View } from 'react-native'
export default function Login() {
    return (
        <View style={{
            justifyContent: 'center',
            alignItems: "center",
            flex: 1,
        }}>
            <>
                <Logo />
                <View>
                    <Text style={{ paddingTop: 60, color: "#ffffff", fontSize: 16, textAlign: 'center', maxWidth: 260 }}>
                        Если вы уже зарегестрированы, войдите в свой профиль
                    </Text>
                    <Button title=''>

                    </Button>
                </View>
            </>

        </View>
    )
}
