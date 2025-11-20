type Props = {
  amount: number;
};

export default function Burnie({ amount }: Props) {
  let status = 'Mild heat';
  if (amount >= 100) {
    status = 'MENACE DETECTED';
  } else if (amount >= 25) {
    status = 'Spicy';
  }

  let icon = '[ ]';
  if (amount >= 100) {
    icon = '[!!]';
  } else if (amount >= 25) {
    icon = '[*]';
  } else {
    icon = '[: ]';
  }

  return (
    <div className="flex items-center gap-2 text-sm font-mono">
      <span aria-hidden="true">{icon}</span>
      <span>{status}</span>
    </div>
  );
}
