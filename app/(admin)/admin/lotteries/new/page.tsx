import CreateLotteryForm from "./CreateLotteryForm";

export default function NewLotteryPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Шинэ сугалаа үүсгэх</h1>
        <p className="text-sm text-gray-500">Шинэ автомашины сугалаа нэмэх</p>
      </div>
      <CreateLotteryForm />
    </div>
  );
}
