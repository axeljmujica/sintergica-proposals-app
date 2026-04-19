import React from 'react';
import { Document, Page, View, Text } from '@react-pdf/renderer';
import { styles, COLORS } from './styles';
import type { PDFNode, PDFRun } from './html-to-pdf';

function runStyle(r: PDFRun) {
  if (r.bold && r.italic) return styles.boldItalic;
  if (r.bold) return styles.bold;
  if (r.italic) return styles.italic;
  return null;
}

function Runs({ runs }: { runs: PDFRun[] }) {
  return (
    <>
      {runs.map((r, j) => {
        const s = runStyle(r);
        return (
          <Text key={j} style={s || undefined}>
            {r.text}
          </Text>
        );
      })}
    </>
  );
}

function renderNode(node: PDFNode, key: number) {
  switch (node.type) {
    case 'cover':
      return (
        <View key={key} style={styles.cover}>
          {node.brand ? <Text style={styles.coverBrand}>{node.brand}</Text> : null}
          {node.tag ? <Text style={styles.coverTag}>{node.tag}</Text> : null}
          {node.label ? <Text style={styles.coverLabel}>{node.label}</Text> : null}
          {node.title ? <Text style={styles.coverTitle}>{node.title}</Text> : null}
          {node.sub ? <Text style={styles.coverSub}>{node.sub}</Text> : null}
          {node.meta.map((m, j) => (
            <View key={j} style={styles.coverMetaBlock}>
              {m.label ? <Text style={styles.coverMetaLabel}>{m.label}</Text> : null}
              {m.value ? <Text>{m.value}</Text> : null}
            </View>
          ))}
        </View>
      );
    case 'h1':
      return (
        <Text key={key} style={styles.h1}>
          {node.text}
        </Text>
      );
    case 'h2':
      return (
        <Text key={key} style={styles.h2}>
          {node.text}
        </Text>
      );
    case 'h3':
      return (
        <Text key={key} style={styles.h3}>
          {node.text}
        </Text>
      );
    case 'h4':
      return (
        <Text key={key} style={styles.h4}>
          {node.text}
        </Text>
      );
    case 'paragraph':
      return (
        <Text key={key} style={styles.paragraph}>
          <Runs runs={node.runs} />
        </Text>
      );
    case 'list':
      return (
        <View key={key} style={styles.list}>
          {node.items.map((item, j) => (
            <View key={j} style={styles.listItem}>
              <Text style={styles.listBullet}>{node.ordered ? `${j + 1}.` : '•'}</Text>
              <Text style={styles.listText}>
                <Runs runs={item} />
              </Text>
            </View>
          ))}
        </View>
      );
    case 'table': {
      const columnCount = Math.max(node.headers.length, ...node.rows.map((r) => r.cells.length), 1);
      return (
        <View key={key} style={styles.table}>
          {node.headers.length > 0 ? (
            <View style={styles.tableRow} fixed>
              {Array.from({ length: columnCount }).map((_, j) => (
                <Text key={j} style={[styles.tableHeaderCell, { flex: 1 }]}>
                  {node.headers[j] || ''}
                </Text>
              ))}
            </View>
          ) : null}
          {node.rows.map((row, j) => {
            const variantStyle =
              row.variant === 'pricing-row'
                ? styles.pricingRow
                : row.variant === 'pricing-total'
                  ? styles.pricingTotal
                  : j % 2 === 1
                    ? styles.tableCellAlt
                    : null;
            return (
              <View key={j} style={styles.tableRow} wrap={false}>
                {Array.from({ length: columnCount }).map((_, k) => (
                  <Text
                    key={k}
                    style={[
                      styles.tableCell,
                      { flex: 1 },
                      variantStyle as object | null,
                    ].filter(Boolean) as any}
                  >
                    {row.cells[k] || ''}
                  </Text>
                ))}
              </View>
            );
          })}
        </View>
      );
    }
    case 'blockquote':
      return (
        <Text key={key} style={styles.blockquote}>
          {node.text}
        </Text>
      );
  }
}

export function ProposalPDF({
  nodes,
  headerText,
}: {
  nodes: PDFNode[];
  headerText: string;
}) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View
          fixed
          style={{
            position: 'absolute',
            top: 30,
            left: 72,
            right: 72,
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingBottom: 6,
            borderBottomWidth: 0.5,
            borderBottomColor: COLORS.rule,
            borderBottomStyle: 'solid',
          }}
          render={({ pageNumber }) =>
            pageNumber > 1 ? (
              <>
                <Text style={{ fontSize: 9, color: COLORS.navy, fontFamily: 'Helvetica-Bold' }}>
                  SINTÉRGICA
                </Text>
                <Text style={{ fontSize: 8, color: COLORS.muted, fontStyle: 'italic' }}>
                  {headerText}
                </Text>
              </>
            ) : (
              <Text> </Text>
            )
          }
        />
        <View
          fixed
          style={{
            position: 'absolute',
            bottom: 30,
            left: 72,
            right: 72,
            paddingTop: 6,
            borderTopWidth: 0.5,
            borderTopColor: COLORS.rule,
            borderTopStyle: 'solid',
            alignItems: 'center',
          }}
          render={({ pageNumber }) => (
            <Text style={{ fontSize: 9, color: COLORS.muted }}>
              {`Documento Confidencial · Pág. ${pageNumber}`}
            </Text>
          )}
        />
        {nodes.map((node, i) => renderNode(node, i))}
      </Page>
    </Document>
  );
}
