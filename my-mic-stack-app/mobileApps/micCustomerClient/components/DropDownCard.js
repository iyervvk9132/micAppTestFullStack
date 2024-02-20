import { TouchableWithoutFeedback } from "react-native";
import { View } from "react-native-web";
import TEST from "../assets/CLOTHES.json"
var clothList=TEST.MAIN_LIST[0].SUBCLASS[0].CLOTHES;
function DropdownCard(){
    return(
        <View>
            <Text>{clothList}</Text>
        </View>
    )
}
export default DropdownCard