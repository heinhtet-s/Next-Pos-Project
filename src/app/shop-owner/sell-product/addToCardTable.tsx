import SellTable from "@/components/ui/SellTable";
import { Button } from "@/components/ui/button";
import DashboardCard from "@/components/ui/dashboardCard";
import { Input } from "@/components/ui/input";
import { productType } from "@/dto/response";
import { CartNumber } from "@/dto/utils";
import { RootState } from "@/lib/store";
import {
  ClearCart,
  ProductItemType,
  ProductState,
  RemoveToCart,
  UpdateToCart,
} from "@/lib/store/productSlice";
import { Select } from "flowbite-react";
import { AiTwotoneDelete } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { Card } from "@/components/ui/card";
import Sticker from "@/assets/images/logoIcon.png";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
export default function AddToCartTable({
  cartNumber,
  setCartNumber,
}: {
  cartNumber: CartNumber;
  setCartNumber: React.Dispatch<React.SetStateAction<CartNumber>>;
}) {
  const dispatch = useDispatch();
  const addToCartData: ProductState = useSelector(
    (state: RootState) => state.productReducer
  );
  const columns = [
    {
      header: "Action",
      accessor: "action",
    },
    {
      header: "Item name",
      accessor: "itemName",
    },
    {
      header: "Sell Price",
      accessor: "sellPrice",
    },
    {
      header: "unit",
      accessor: "unit",
    },
    {
      header: "Qty",
      accessor: "qty",
    },

    {
      header: "Cost",
      accessor: "cost",
    },
  ];

  const deleteItem = (item: ProductItemType) => {
    dispatch(
      RemoveToCart({
        id: item.id,
        unit: item.unit,
        cartNumber,
      })
    );
  };
  const handleAddToCart = (product: ProductItemType) => {
    dispatch(
      UpdateToCart({
        id: product.id,
        qty: product.qty + 1,
        unit: product.unit,
        unitRelation: product.unitRelation,
        cartNumber,
      })
    );
  };

  const handleRemoveToCart = (product: ProductItemType) => {
    if (product.qty === 1) return;
    dispatch(
      UpdateToCart({
        id: product.id,
        qty: product.qty - 1,
        unit: product.unit,
        unitRelation: product.unitRelation,
        cartNumber,
      })
    );
  };

  const handleQtyChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    product: ProductItemType
  ) => {
    dispatch(
      UpdateToCart({
        id: product.id,
        qty: +e.target.value === 0 ? 1 : +e.target.value,
        unit: product.unit,
        unitRelation: product.unitRelation,
        cartNumber,
      })
    );
  };

  const data =
    addToCartData[cartNumber]?.map((el: ProductItemType) => {
      return {
        action: (
          <button
            onClick={() => deleteItem(el)}
            className=" text-red-500  rounded-lg px-3 py-2"
          >
            <AiTwotoneDelete className="text-xl" />
          </button>
        ),
        unit: el.unit,
        itemName: el.name,
        sellPrice: el.price,
        qty: (
          <div className="flex">
            <button
              onClick={() => {
                handleAddToCart(el);
              }}
              className="bg-primary mr-1 text-white rounded-lg px-2 py-1"
            >
              +
            </button>
            <Input
              value={el.qty}
              onChange={(e) => handleQtyChange(e, el)}
              className="w-20"
              type="number"
            />
            <button
              onClick={() => handleRemoveToCart(el)}
              className="bg-primary ml-1 text-white rounded-lg px-2 py-1"
            >
              -
            </button>
          </div>
        ),
        cost: el.cost,
      };
    }) || [];
  const router = useRouter();
  return (
    <DashboardCard>
      <div className="mb-3 bg-backgroundColor p-3 rounded-lg flex items-center justify-between">
        <Select
          value={cartNumber}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setCartNumber(e.target.value as CartNumber)
          }
        >
          <option value="one">One</option>
          <option value="two">Two</option>
          <option value="three">Three</option>
          <option value="four">Four</option>
          <option value="five">Five</option>
        </Select>
        <h3 className="font-bold text-md ">Selected Items</h3>
        <Button
          variant="default"
          onClick={() => {
            router.push(
              `/shop-owner/sell-product/voucher-setup?cartNumber=${cartNumber} `
            );
          }}
        >
          Submit Sale
        </Button>
      </div>

      <div className="flex items-center justify-between mb-3 ">
        <Button
          variant="destructive"
          onClick={() => dispatch(ClearCart(cartNumber))}
        >
          Clear Cart
        </Button>
        <p className="text-green-800">
          Total{" "}
          <span className="font-bold ">
            =
            {addToCartData[cartNumber]?.reduce(
              (sum, product: ProductItemType) => sum + product.cost,
              0
            )}
            Ks
          </span>
        </p>
      </div>
      <SellTable columns={columns} data={data} />
    </DashboardCard>
  );
}
