export default function Home() {
  return (
    <main className="space-y-6">
      {/* 标题测试 */}
      <div className="card">
        <h1>Welcome to My Blog</h1>
        <h2>This is a subtitle</h2>
        <h3>And a smaller heading</h3>
        
        {/* 按钮测试 */}
        <div className="space-x-4 mt-4">
          <button className="btn-primary">
            Primary Button
          </button>
          <button className="btn-secondary">
            Secondary Button
          </button>
        </div>
      </div>

      {/* 卡片测试 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card">
            <h3>Card {i}</h3>
            <p className="text-gray-600 dark:text-gray-300">
              This is a sample card to test the styling.
            </p>
            <a href="#" className="block mt-4">
              Read more →
            </a>
          </div>
        ))}
      </div>
    </main>
  )
}
