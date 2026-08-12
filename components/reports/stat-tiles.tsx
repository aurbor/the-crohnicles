export function StatTiles({
  tiles,
}: {
  tiles: { label: string; value: string }[];
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {tiles.map((tile) => (
        <div key={tile.label} className="card p-3">
          <p className="text-xs font-medium text-muted">{tile.label}</p>
          <p className="mt-1 text-xl font-extrabold">{tile.value}</p>
        </div>
      ))}
    </div>
  );
}
