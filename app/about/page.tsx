export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-10 space-y-6">
      <h1 className="text-2xl font-semibold">About StyleScope</h1>
      <p>
        <b>What StyleScope is:</b> An interactive lab where people upload or pick texts, then see and probe
        “style geometry”: per-layer trajectories, low-dimensional style subspaces, probe accuracy, shuffling tests, and cross-lingual alignments—live, not as a static paper figure.
      </p>
      <p>
        Have you ever wondered what literary style really is? How do rhythm, syntax, tone, and texture converge to produce a specific effect on the reader? Some writers, such as Emily Dickinson and James Joyce, possess such distinctive voices that you can recognize them instantly after only a little exposure. You might point to certain surface traits, like Dickinson’s dashes, that contribute to her unmistakable effect. But you can’t write a Dickinson poem by simply following her punctuation patterns; genius in literature is more elusive, arising from the interplay of tone, rhythm, texture, and structure. Like great music, great writing feels both entirely familiar and utterly strange.
      </p>
      <p>
        StyleScope begins from a simple discovery: language models can feel style. In the 2025 paper “What’s in a Prompt? Language Models Encode Literary Style in Prompt Embeddings” (Sarfati, Moller, Liu, Boullé & Earls), we found that even the smallest fragments of text—ten to a hundred words—leave a distinct stylistic fingerprint inside a model’s neural space. These models, trained only to predict the next word, end up learning something far more mysterious: the shape of an author’s voice.
      </p>
      <p>
        Our study revealed that transformer models don’t just capture what is said but also how it is said. As text passes through the layers of a model, it takes on a recognizable form. Classifiers trained on these embeddings could identify authors such as Woolf, Melville, or Austen with up to ninety percent accuracy, even from short excerpts. We also found that literary style occupies a surprisingly compact region of the model’s latent space—around sixteen principal components—suggesting that something as intangible as voice can be represented geometrically. Shuffling the order of words barely affected the model’s ability to distinguish between authors, implying that diction rather than syntax carries the essence of style. And remarkably, the same stylistic geometry appeared across languages, revealing that the model’s sense of voice transcends translation.
      </p>
      <p>
        These findings change how we think about both literature and machines. Style turns out to be something that can be perceived by machines, as well as measured, mapped, and visualized. This opens new possibilities for authorship attribution, literary history, and AI interpretability, fields that together illuminate how models internalize not only information but also art. StyleScope transforms this research into an interactive exploration: a way to see how literary voice takes shape inside a model’s mind, and to trace, perhaps for the first time, the hidden geometry of style itself.
      </p>
      <p>
        We keep the writing plain and the visuals helpful. Every chart includes a one-click “Reproduce” cell so you can script the exact run.
      </p>
    </div>
  );
}


