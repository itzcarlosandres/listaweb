/**
 * Calcula el score de trending para un proyecto según las métricas de las últimas 24h
 * Fórmula configurable:
 * score = (votes_24h * voteWeight + comments_24h * commentWeight + favorites_24h * favoriteWeight + views_24h / viewDivisor) / pow(hours_since_launch + 2, decayExponent)
 */
export function calculateTrendingScore(
  metrics: {
    votes24h: number;
    comments24h: number;
    favorites24h: number;
    views24h: number;
    launchDate: Date;
    isBoosted?: boolean;
  },
  weights?: {
    voteWeight?: number;
    commentWeight?: number;
    favoriteWeight?: number;
    viewDivisor?: number;
    decayExponent?: number;
    boostBonus?: number;
  }
): number {
  const now = new Date();
  const diffHours = Math.max(
    0,
    (now.getTime() - new Date(metrics.launchDate).getTime()) / (1000 * 60 * 60)
  );

  const voteW = weights?.voteWeight ?? 4.0;
  const commentW = weights?.commentWeight ?? 5.0;
  const favW = weights?.favoriteWeight ?? 2.0;
  const viewDiv = weights?.viewDivisor ?? 10.0;
  const decayExp = weights?.decayExponent ?? 0.4;
  const boostBonus = weights?.boostBonus ?? 100.0;

  const boostPoints = metrics.isBoosted ? boostBonus : 0;

  const numerator =
    metrics.votes24h * voteW +
    metrics.comments24h * commentW +
    metrics.favorites24h * favW +
    metrics.views24h / viewDiv +
    boostPoints;

  const denominator = Math.pow(diffHours + 2, decayExp);

  return Number((numerator / denominator).toFixed(4));
}
