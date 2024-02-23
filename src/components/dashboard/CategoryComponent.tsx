import { categoryType } from "@/dto/response";

const CategoryComponent = ({
  category,
  setActiveCategory,
  activeCategory,
}: {
  category: categoryType;
  setActiveCategory: React.Dispatch<React.SetStateAction<string>>;
  activeCategory: string;
}) => {
  return (
    <div
      onClick={() => setActiveCategory(category.name)}
      key={category.id}
      className={`inline-block whitespace-nowrap max-w-content mx-2 grow cursor-pointer  p-2  px-4 rounded-lg ${
        activeCategory === category.name ? "bg-primary text-white" : "bg-white"
      }`}
    >
      <p>{category.name} </p>
    </div>
  );
};
export default CategoryComponent;
