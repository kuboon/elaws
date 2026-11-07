import LawXml from "../lib/server/LawXmlFxp.ts";

const xml = `<DataRoot><Result><Code>0</Code></Result><ApplData><LawFullText>
<Law><LawBody><LawTitle>テスト法</LawTitle><MainProvision>
<Article Num="1"><ArticleCaption>（目的）</ArticleCaption><ArticleTitle>第一条</ArticleTitle>
<Paragraph Num="1"><ParagraphNum/><ParagraphSentence><Sentence>第一項。</Sentence></ParagraphSentence>
<Item Num="1"><ItemTitle>一</ItemTitle><ItemSentence><Sentence>第一号。</Sentence></ItemSentence></Item>
<Item Num="2"><ItemTitle>二</ItemTitle><ItemSentence><Sentence>第二号。</Sentence></ItemSentence></Item>
</Paragraph>
<Paragraph Num="2"><ParagraphNum>２</ParagraphNum><ParagraphSentence><Sentence>第二項。</Sentence></ParagraphSentence></Paragraph>
</Article></MainProvision>
<SupplProvision><Paragraph Num="1"><ParagraphSentence><Sentence>附則一。</Sentence></ParagraphSentence></Paragraph></SupplProvision>
<SupplProvision AmendLawNum="x"><Paragraph Num="1"><ParagraphSentence><Sentence>附則二。</Sentence></ParagraphSentence></Paragraph></SupplProvision>
</LawBody></Law></LawFullText></ApplData></DataRoot>`;

function assertEquals(actual: unknown, expected: unknown) {
  const a = JSON.stringify(actual), e = JSON.stringify(expected);
  if (a !== e) throw new Error(`expected ${e}, got ${a}`);
}

Deno.test("LawXml", () => {
  const law = new LawXml(xml);
  assertEquals(law.isOk(), true);
  assertEquals(law.title(), "テスト法");
  assertEquals(law.getSentenceFrom("1-2"), "２ 第二項。");
  assertEquals(law.getSentenceFrom("1-1-2"), "二 第二号。");
  assertEquals(law.getSentenceFrom("1-3"), undefined);
  assertEquals(law.getSentenceFrom("s-1-0-1"), "附則二。");
  assertEquals(law.getLinesFrom("1"), [
    "（目的） 第一条",
    "第一項。",
    "一 第一号。",
    "二 第二号。",
    "２ 第二項。",
  ]);
});
