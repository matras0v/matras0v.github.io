/* Verified manufacturer Detailing catalogue: https://www.zvizzer.com/wp-content/uploads/2024/03/ZVIZZER_DETAILING.pdf
 * Exact 750 ml articles. No supplied local price/availability: inquiry-only (0/0).
 * Append-only preserves all existing cart IDs and original inventory data. */
for (const [code,article,description] of [
 ['HC4000','ZV-ST00075010HC','Абразивная полировальная паста для коррекции лакокрасочного покрытия.'],
 ['MC3000','ZV-ST00075010MC','Среднеабразивная полировальная паста для промежуточного этапа.'],
 ['FC2000','ZV-ST00075010FC','Финишная полировальная паста для завершающего этапа.']
]) {
 if(P.some(p=>p[F.ART]===article))continue;
 const i=P.length,d=DS.length;
 DS.push(description);
 P.push([code+' — полировальная паста',BR.indexOf('Zvizzer'),0,'studio/zv-'+code.toLowerCase()+'.webp',0,'polish',d,'750 мл',article]);
 VARIANTS[i]=[i];
}
