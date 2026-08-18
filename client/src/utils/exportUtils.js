/**
 * Formats and downloads complete transcript metadata as a formatted JSON file.
 */
export const exportToJson = (transcript) => {
  if (!transcript) return;

  const exportData = {
    title: transcript.title,
    fileName: transcript.fileName,
    status: transcript.status,
    createdAt: transcript.createdAt,
    metadata: transcript.metadata || {}
  };

  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(exportData, null, 2)
  )}`;
  
  const cleanTitle = (transcript.title || 'transcript')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', `${cleanTitle}_metadata.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};

/**
 * Formats and downloads transcript metadata as a structured CSV file.
 */
export const exportToCsv = (transcript) => {
  if (!transcript || !transcript.metadata) return;

  const meta = transcript.metadata;
  const rows = [];

  // General Metadata Section
  rows.push(['FIELD', 'VALUE']);
  rows.push(['Title', `"${(transcript.title || '').replace(/"/g, '""')}"`]);
  rows.push(['Status', transcript.status]);
  rows.push(['Category', meta.category?.label || 'N/A']);
  rows.push(['Category Confidence', `${((meta.category?.confidence || 0) * 100).toFixed(1)}%`]);
  rows.push(['Sentiment Polarity', meta.sentiment?.polarity || 'N/A']);
  rows.push(['Sentiment Score', meta.sentiment?.score || '0.0']);
  rows.push([]);

  // Keywords Section
  rows.push(['KEYWORDS']);
  if (meta.keywords && meta.keywords.length > 0) {
    meta.keywords.forEach((kw) => rows.push([`"${kw.replace(/"/g, '""')}"`]));
  } else {
    rows.push(['None']);
  }
  rows.push([]);

  // Entities Section
  rows.push(['ENTITY TEXT', 'ENTITY LABEL']);
  if (meta.entities && meta.entities.length > 0) {
    meta.entities.forEach((ent) => {
      rows.push([`"${(ent.text || '').replace(/"/g, '""')}"`, ent.label]);
    });
  } else {
    rows.push(['None', '']);
  }
  rows.push([]);

  // Emotions Section
  rows.push(['EMOTION', 'CONFIDENCE SCORE']);
  if (meta.emotions && meta.emotions.length > 0) {
    meta.emotions.forEach((emo) => {
      rows.push([emo.label, `${((emo.score || 0) * 100).toFixed(2)}%`]);
    });
  }
  rows.push([]);

  // Speakers Section
  rows.push(['SPEAKER', 'LINE COUNT']);
  if (meta.speakers && meta.speakers.length > 0) {
    meta.speakers.forEach((spk) => {
      rows.push([`"${(spk.speaker || '').replace(/"/g, '""')}"`, spk.lineCount]);
    });
  } else {
    rows.push(['None Detected', '0']);
  }

  const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
  
  const cleanTitle = (transcript.title || 'transcript')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', encodeURI(csvContent));
  downloadAnchor.setAttribute('download', `${cleanTitle}_metadata.csv`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};
