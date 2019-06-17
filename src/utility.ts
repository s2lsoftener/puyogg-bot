import ELO from 'arpad';

export function cleanIdString(atName: string): string {
  return atName.replace(/\D/g, '');
}

export function newELO(scores: [number, number], current_elo: [number, number], kvalue?: number): [number, number] {
  const [p1_score, p2_score] = scores;
  const [p1_elo, p2_elo] = current_elo;
  let p1_new_elo: number, p2_new_elo: number;
  const elo = kvalue === undefined ? new ELO() : new ELO(kvalue);

  const winner = p1_score > p2_score ? 'p1' : 'p2';

  if (winner === 'p1') {
    p1_new_elo = elo.newRatingIfWon(p1_elo, p2_elo);
    p2_new_elo = elo.newRatingIfLost(p2_elo, p1_elo);
  } else {
    p1_new_elo = elo.newRatingIfLost(p1_elo, p2_elo);
    p2_new_elo = elo.newRatingIfWon(p2_elo, p1_elo);
  }

  return [p1_new_elo, p2_new_elo];
}