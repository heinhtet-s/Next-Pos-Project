import { createSlice, current } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
export interface ProductItemType {
  id: string;
  name: string;
  price: number;
  unit: string;
  qty: number;
  stock: number;
  searchIndex: string;
  cost: number;
  unitRelation: number;
  buyPrice: number;
}

export interface ProductState {
  one: ProductItemType[] | [];
  two: ProductItemType[] | [];
  three: ProductItemType[] | [];
  four: ProductItemType[] | [];
  five: ProductItemType[] | [];
}

const initialState: ProductState = {
  one: [],
  two: [],
  three: [],
  four: [],
  five: [],
};

export const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    AddToCart: (
      state,
      action: PayloadAction<{
        id: string;
        name: string;
        price: number;
        unit: string;
        unitRelation: number;
        qty: number;
        stock: number;
        buyPrice: number;
        cartNumber: "one" | "two" | "three" | "four" | "five";
      }>
    ) => {
      const currentCart = state[action.payload.cartNumber];
      console.log(currentCart, "currentCart");
      const currentItemIndex = currentCart.findIndex(
        (item) => item.searchIndex === action.payload.id + action.payload.unit
      );

      const relationData = [...currentCart].filter(
        (item) =>
          item.id == action.payload.id && item.unit !== action.payload.unit
      );

      const relationQtyCount =
        relationData.reduce(
          (acc, item) => item.qty * item.unitRelation + acc,
          0
        ) || 0;
      if (currentItemIndex !== -1) {
        if (
          (currentCart[currentItemIndex].qty + action.payload.qty) *
            action.payload.unitRelation +
            relationQtyCount >
          currentCart[currentItemIndex].stock
        ) {
          toast.warning("out of stock ");
          return;
        }

        currentCart[currentItemIndex].qty += action.payload.qty;

        state[action.payload.cartNumber] = currentCart;
        return;
      }

      if (
        action.payload.qty * action.payload.unitRelation + relationQtyCount >
        action.payload.stock
      )
        return;
      state[action.payload.cartNumber] = [
        ...currentCart,
        {
          id: action.payload.id,
          name: action.payload.name,
          price: action.payload.price,
          unit: action.payload.unit,
          qty: action.payload.qty,
          unitRelation: action.payload.unitRelation,
          stock: action.payload.stock,
          buyPrice: action.payload.buyPrice,
          cost:
            action.payload.qty *
            action.payload.unitRelation *
            action.payload.price,
          searchIndex: action.payload.id + action.payload.unit,
        },
      ];
    },
    RemoveToCart: (
      state,
      action: PayloadAction<{
        id: string;
        unit: string;
        cartNumber: "one" | "two" | "three" | "four" | "five";
      }>
    ) => {
      const currentCart = state[action.payload.cartNumber];
      const currentItemIndex = currentCart.findIndex(
        (item) => item.searchIndex === action.payload.id + action.payload.unit
      );
      if (currentItemIndex !== -1) {
        currentCart.splice(currentItemIndex, 1);
        state[action.payload.cartNumber] = currentCart;
      }
    },
    UpdateToCart: (
      state,
      action: PayloadAction<{
        id: string;
        unit: string;
        qty: number;
        unitRelation: number;
        cartNumber: "one" | "two" | "three" | "four" | "five";
      }>
    ) => {
      const currentCart = state[action.payload.cartNumber];
      const currentItemIndex = currentCart.findIndex(
        (item) => item.searchIndex === action.payload.id + action.payload.unit
      );
      const relationData = [...currentCart].filter(
        (item) =>
          item.id == action.payload.id && item.unit !== action.payload.unit
      );

      const relationQtyCount =
        relationData.reduce(
          (acc, item) => item.qty * item.unitRelation + acc,
          0
        ) || 0;
      if (
        +action.payload.qty * action.payload.unitRelation + relationQtyCount >
        +currentCart[currentItemIndex].stock
      ) {
        toast.warning("out of stock ");
        return;
        // currentCart[currentItemIndex].qty = Math.floor(
        //   currentCart[currentItemIndex].stock / action.payload.unitRelation
        // );
        // currentCart[currentItemIndex].cost =
        //   currentCart[currentItemIndex].price *
        //   Math.floor(
        //     currentCart[currentItemIndex].stock / action.payload.unitRelation
        //   );
      }

      if (currentItemIndex !== -1) {
        currentCart[currentItemIndex].qty = action.payload.qty;
        currentCart[currentItemIndex].cost =
          currentCart[currentItemIndex].price *
          (action.payload.qty * action.payload.unitRelation);
        state[action.payload.cartNumber] = currentCart;
      }
    },

    ClearCart: (
      state,
      action: PayloadAction<"one" | "two" | "three" | "four" | "five">
    ) => {
      state[action.payload] = [];
    },
    ClearAllCart: (state) => {
      state.one = [];
      state.two = [];
      state.three = [];
      state.four = [];
      state.five = [];
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  AddToCart,
  RemoveToCart,
  UpdateToCart,
  ClearCart,
  ClearAllCart,
} = productSlice.actions;

export default productSlice.reducer;
