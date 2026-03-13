import React from "react";
import {
    Dimensions,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { height } = Dimensions.get("window");

type DropdownItem = {
  id: number;
  name: string;
};

type Props = {
  visible: boolean;
  data?: DropdownItem[];
  onSelect: (item: DropdownItem) => void;
  onClose: () => void;
  theme: any;
};

const DropdownModal = ({
  visible,
  data = [],
  onSelect,
  onClose,
  theme,
}: Props) => {
  const renderItem = ({ item }: { item: DropdownItem }) => (
    <TouchableOpacity
      style={[styles.item, { borderBottomColor: theme.colors.colorBorder }]}
      onPress={() => onSelect(item)}
    >
      <Text style={[styles.itemText, { color: theme.colors.colorTextPrimary }]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal transparent visible={visible} animationType="slide">
      <TouchableOpacity
        style={styles.overlay}
        onPress={onClose}
        activeOpacity={1}
      >
        <View style={[styles.sheet, { backgroundColor: theme.colors.colorBgPage }]}>
          <FlatList
            data={data ?? []}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default React.memo(DropdownModal);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    maxHeight: height * 0.5,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  item: {
    padding: 16,
    borderBottomWidth: 1,
  },
  itemText: {
    fontSize: 16,
  },
});