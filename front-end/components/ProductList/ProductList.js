// ProductList.js

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Platform,
  Image,
  TouchableOpacity,
  TextInput,
} from "react-native";
import Modal from "react-native-modal";
import { fetchExplorer } from "../../pages/Profile/Add/Explorer/ExplorerFunctions";
import * as ProductListFunctions from "./ProductListFunctions";
const PAGE_SIZE = 10;
const ipAddress = "192.168.1.9";
const ProductList = ({ category }) => {
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);
  const [quantity, setQuantity] = useState("");

  // Function to get the name of the handleConfirm function based on the category
  const getHandleConfirmFunctionName = (category) => {
    switch (category) {
      case "vegetables":
        return "handleConfirmVegetables";
      case "meat":
        return "handleConfirmMeat";
      // Add more cases for other categories if needed
      default:
        throw new Error("Unknown category");
    }
  };

  const handleConfirm =
    ProductListFunctions[getHandleConfirmFunctionName(category)];

  useEffect(() => {
    // Load initial data
    loadMoreData();
  }, [category]); // Reload when the category changes

  const loadMoreData = async () => {
    try {
      // Fetch data from the API using the function and the provided category
      const newData = await fetchExplorer(category);

      // Calculate the start index based on the current page and page size
      const startIndex = (page - 1) * PAGE_SIZE;
      // Calculate the end index
      const endIndex = startIndex + PAGE_SIZE;

      // Slice the data to get the current page's worth of items
      const slicedData = newData.slice(startIndex, endIndex);

      // Update the products state with the new data
      setProducts((prevProducts) => [...prevProducts, ...slicedData]);

      // Increment the page for the next load
      setPage((prevPage) => prevPage + 1);
    } catch (error) {
      // Handle error if the API call fails
      console.error("Error loading data:", error);
    }
  };

  const toggleModal = (index) => {
    setSelectedItemIndex(index === selectedItemIndex ? null : index);
  };

  const renderProductCard = ({ item, index }) => (
    <View style={styles.productCard}>
      <TouchableOpacity onPress={() => toggleModal(index)}>
        <View>
          <Image source={{ uri: item.image }} style={styles.productImage} />
        </View>

        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>{item.price}</Text>
      </TouchableOpacity>
      <Modal
        isVisible={selectedItemIndex === index}
        onBackdropPress={() => setSelectedItemIndex(null)}
        onBackButtonPress={() => setSelectedItemIndex(null)}
        backdropOpacity={0.5}
      >
        <View style={styles.modalContent}>
          <View>
            <Image source={{ uri: item.image }} style={styles.modalImage} />
          </View>
          <Text style={styles.title}>{item.name}</Text>
          <Text style={styles.modalText}>{`Unit Price: ${item.price}`}</Text>
          <TextInput
            placeholder="Quantity"
            value={quantity.toString()}
            onChangeText={(text) => setQuantity(text)}
            style={styles.input}
          />
          {quantity !== "" && (
            <Text style={styles.modalText}>{`Total: Rs.${
              (parseFloat(item.price.replace(/\D/g, "")) *
                parseFloat(quantity)) /
              100
            }/=`}</Text>
          )}
          <TouchableOpacity
            style={styles.button}
            onPress={() => handleConfirm(item, quantity)} // Call handleConfirm with the item
          >
            <View style={styles.contentWrapper}>
              <Text style={styles.buttonText}>{"Confirm"}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setSelectedItemIndex(null);
            }}
          >
            <Text style={styles.closeButton}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );

  return (
    <FlatList
      data={products}
      renderItem={renderProductCard}
      keyExtractor={(item, index) => `${item.name}_${index}`}
      numColumns={2}
      contentContainerStyle={styles.productList}
      onEndReached={loadMoreData}
      onEndReachedThreshold={0.1}
    />
  );
};

const styles = StyleSheet.create({
  productList: {
    padding: 16,
  },
  productCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
    margin: 8,
    padding: 16,
    alignItems: "center",
    elevation: Platform.OS === "android" ? 4 : 0, // Apply elevation only on Android
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
    }),
  },
  productImage: {
    width: "100%",
    height: 100, // Placeholder height for the image
    backgroundColor: "#f2f2f2", // Placeholder background color
    marginBottom: 10,
    objectFit: "fill",
  },
  modalImage: {
    width: "50%",
    height: 100, // Placeholder height for the image
    backgroundColor: "#f2f2f2", // Placeholder background color
    marginBottom: 10,
    alignSelf: "center",
    objectFit: "fill",
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 14,
    color: "#888",
  },
  title: {
    alignSelf: "center",
    color: "black",
    fontSize: 25,
    marginBottom: 30,
    fontWeight: "700",
  },
  input: {
    borderColor: "gray",
    borderWidth: 1,
    backgroundColor: "white",
    padding: 2,
    paddingLeft: 25,
    borderRadius: 10,
    width: 100,
    alignSelf: "center",
    marginBottom: 30,
  },
  modalText: {
    alignSelf: "center",
    color: "black",
    fontSize: 22,
    marginBottom: 30,
    fontWeight: "700",
  },
  modalContent: {
    flex: 1,
    alignSelf: "center",
    backgroundColor: "white",
    marginTop: 0,
    justifyContent: "center",
    padding: 15,
    borderRadius: 10,
    width: 300,
    maxHeight: 500,
  },
  closeButton: {
    marginTop: 20,
    marginBottom: 30,
    alignSelf: "center",
    color: "green",
    fontSize: 15,
  },
  button: {
    backgroundColor: "green",
    width: 200,
    borderRadius: 10,
    alignSelf: "center",
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    flex: 1,
    alignSelf: "center",
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 11,
  },
});

export default ProductList;
