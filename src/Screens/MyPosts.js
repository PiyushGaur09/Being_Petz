import { View, Text } from 'react-native'
import React from 'react'

const MyPosts = ({route}) => {
  return (
    <View>
      <Text>MyPosts:{route.params?.petId}</Text>
    </View>
  )
}

export default MyPosts