// Only editable fields belong in form state and save requests.
const fields=['title','ruleType','audience','targetUserId','targetGroupId','metric','targetValue','period','startDate','durationDays','winnersCount','badgeTitle','bonusPoints','status'];
export const rewardRuleValues=rule=>Object.fromEntries(fields.filter(key=>rule[key]!==undefined).map(key=>[key,rule[key]]));
export const rewardRulePayload=values=>rewardRuleValues(values);
