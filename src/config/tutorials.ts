export interface TutorialStep {
  title: string
  description: string
}

export interface TutorialFaq {
  question: string
  answer: string
}

export interface TutorialDefinition {
  slug: string
  title: string
  description: string
  searchIntent: string
  intro: string
  whenToUse: string[]
  steps: TutorialStep[]
  commonMistakes: string[]
  faqs: TutorialFaq[]
  targetToolSlug: string
  estimatedTime: string
  difficulty: 'Fácil' | 'Médio' | 'Difícil'
}

export const tutorials: TutorialDefinition[] = [
  {
    slug: 'como-converter-imagem-em-pdf',
    title: 'Como converter imagem em PDF online',
    description:
      'Aprenda como transformar JPG, JPEG e PNG em PDF em poucos passos usando a ferramenta certa.',
    searchIntent: 'como converter imagem em pdf',
    intro:
      'Se você precisa enviar fotos, documentos escaneados ou comprovantes em um único arquivo, converter imagem em PDF costuma ser o caminho mais prático.',
    whenToUse: [
      'Para juntar várias fotos em um único arquivo PDF.',
      'Para enviar documentos em formato aceito por empresas, escolas e órgãos públicos.',
      'Para manter uma ordem fixa de páginas antes do envio.',
    ],
    steps: [
      {
        title: 'Separe as imagens que vão entrar no arquivo',
        description:
          'Reúna os arquivos JPG, JPEG ou PNG que você quer transformar em PDF. Se houver várias imagens, já pense na ordem final.',
      },
      {
        title: 'Envie os arquivos para a ferramenta',
        description:
          'Abra a página de JPG para PDF, selecione as imagens e aguarde o carregamento. O sistema aceita múltiplos arquivos de uma vez.',
      },
      {
        title: 'Reordene antes de gerar o PDF',
        description:
          'Se necessário, arraste os itens para mudar a sequência. Isso ajuda bastante quando você está montando um documento com capa, anexos ou comprovantes.',
      },
      {
        title: 'Gere e baixe o arquivo final',
        description:
          'Clique para converter e baixe o PDF pronto. Cada imagem vira uma página no documento final.',
      },
    ],
    commonMistakes: [
      'Enviar as imagens fora de ordem e só perceber depois do download.',
      'Misturar capturas de tela muito pequenas com fotos grandes, criando diferença visual entre páginas.',
      'Usar imagens borradas esperando que o PDF melhore a legibilidade.',
    ],
    faqs: [
      {
        question: 'Posso converter várias imagens em um único PDF?',
        answer:
          'Sim. A ferramenta aceita vários arquivos e monta um PDF com uma página para cada imagem.',
      },
      {
        question: 'Quais formatos de imagem são aceitos?',
        answer:
          'Atualmente, a ferramenta aceita JPG, JPEG e PNG, que são os formatos mais comuns para esse tipo de conversão.',
      },
    ],
    targetToolSlug: 'jpg-para-pdf',
    estimatedTime: '2 min',
    difficulty: 'Fácil',
  },
  {
    slug: 'como-juntar-pdf',
    title: 'Como juntar PDF sem instalar programas',
    description:
      'Veja como unir dois ou mais arquivos PDF online e organizar a ordem das páginas antes de baixar.',
    searchIntent: 'como juntar pdf',
    intro:
      'Juntar arquivos PDF é uma tarefa comum para quem precisa enviar contratos, anexos, comprovantes ou vários documentos em um único arquivo de forma organizada.',
    whenToUse: [
      'Para unir anexos em um único documento.',
      'Para enviar processos, propostas ou documentos pessoais em um só arquivo.',
      'Para manter tudo organizado antes de compartilhar por e-mail ou WhatsApp.',
    ],
    steps: [
      {
        title: 'Separe todos os PDFs que devem entrar no arquivo final',
        description:
          'Confira se os documentos certos estão separados e se nenhum está faltando antes de iniciar a união.',
      },
      {
        title: 'Envie os arquivos na ferramenta de juntar PDF',
        description:
          'Selecione dois ou mais PDFs e aguarde o carregamento. Depois disso, a lista ficará pronta para a reorganização.',
      },
      {
        title: 'Organize a sequência correta',
        description:
          'Arraste os arquivos para definir a ordem final. Esse passo evita retrabalho e é especialmente importante quando há capa, laudo ou anexos complementares.',
      },
      {
        title: 'Gere o PDF unificado',
        description:
          'Clique para juntar e baixe o novo arquivo consolidado em um único PDF.',
      },
    ],
    commonMistakes: [
      'Juntar os arquivos sem revisar a ordem final.',
      'Misturar versões antigas e novas do mesmo documento.',
      'Enviar um PDF protegido por senha sem perceber que ele pode travar o fluxo de união.',
    ],
    faqs: [
      {
        question: 'Posso juntar mais de dois PDFs?',
        answer:
          'Sim. A ferramenta aceita vários arquivos de uma só vez e permite reorganizar a ordem antes de gerar o PDF final.',
      },
      {
        question: 'Os PDFs originais são alterados?',
        answer:
          'Não. O sistema gera um novo arquivo unificado e preserva seus arquivos originais sem nenhuma alteração.',
      },
    ],
    targetToolSlug: 'juntar-pdf',
    estimatedTime: '1 min',
    difficulty: 'Fácil',
  },
  {
    slug: 'como-dividir-pdf',
    title: 'Como dividir PDF e extrair páginas específicas',
    description:
      'Aprenda como separar páginas de um arquivo PDF em novos documentos de forma simples e rápida.',
    searchIntent: 'como dividir pdf',
    intro:
      'Dividir um PDF é a solução ideal quando você tem um arquivo grande e precisa apenas de algumas páginas ou quer separar capítulos e seções em arquivos diferentes.',
    whenToUse: [
      'Para separar páginas específicas de um contrato ou laudo.',
      'Para dividir um arquivo PDF grande em partes menores.',
      'Para extrair apenas o conteúdo que importa para o seu objetivo.',
    ],
    steps: [
      {
        title: 'Envie o arquivo PDF original',
        description:
          'Selecione o documento que você deseja dividir. O sistema carregará a visualização das páginas.',
      },
      {
        title: 'Defina o intervalo de páginas',
        description:
          'Informe quais páginas devem ser extraídas. Você pode escolher intervalos (ex: 1-5) ou páginas avulsas.',
      },
      {
        title: 'Processe a divisão',
        description:
          'Clique em dividir e aguarde enquanto o sistema cria os novos arquivos baseados na sua seleção.',
      },
      {
        title: 'Baixe os arquivos separados',
        description:
          'O sistema entregará os PDFs prontos para download imediato.',
      },
    ],
    commonMistakes: [
      'Errar o número das páginas por não conferir a prévia.',
      'Tentar dividir PDFs protegidos por senha sem removê-la antes.',
    ],
    faqs: [
      {
        question: 'Posso extrair apenas uma página?',
        answer:
          'Sim, basta colocar o número da página desejada no campo de intervalo.',
      },
      {
        question: 'O arquivo original é mantido?',
        answer:
          'Sim, nós nunca alteramos seu arquivo original. Criamos novas cópias baseadas na sua seleção.',
      },
    ],
    targetToolSlug: 'dividir-pdf',
    estimatedTime: '2 min',
    difficulty: 'Fácil',
  },
  {
    slug: 'como-converter-pdf-em-word',
    title: 'Como converter PDF em Word editável online',
    description:
      'Transforme seus arquivos PDF em documentos do Word (.docx) mantendo a formatação original.',
    searchIntent: 'como converter pdf em word',
    intro:
      'Precisa editar o conteúdo de um PDF? A melhor forma é convertê-lo para Word, permitindo que você altere textos, tabelas e imagens com facilidade.',
    whenToUse: [
      'Para editar textos de documentos que você só possui em PDF.',
      'Para reaproveitar tabelas e dados em novos relatórios.',
      'Para fazer revisões em contratos e propostas comerciais.',
    ],
    steps: [
      {
        title: 'Selecione o arquivo PDF',
        description:
          'Escolha o documento que você deseja transformar em um arquivo do Word.',
      },
      {
        title: 'Inicie a conversão',
        description:
          'O sistema da Unificando irá analisar a estrutura do seu PDF para manter o layout o mais fiel possível.',
      },
      {
        title: 'Aguarde o processamento',
        description:
          'Em poucos segundos, seu arquivo .docx estará pronto para edição.',
      },
      {
        title: 'Baixe e edite',
        description:
          'Faça o download e abra no Microsoft Word, Google Docs ou LibreOffice.',
      },
    ],
    commonMistakes: [
      'Esperar que PDFs digitalizados (fotos de papel) fiquem 100% editáveis sem o uso de OCR avançado.',
      'PDFs com layouts extremamente complexos podem sofrer pequenas variações de alinhamento.',
    ],
    faqs: [
      {
        question: 'O arquivo Word fica idêntico ao PDF?',
        answer:
          'Nos esforçamos para manter a máxima fidelidade, mas documentos com muitos elementos sobrepostos podem exigir pequenos ajustes manuais.',
      },
    ],
    targetToolSlug: 'pdf-para-word',
    estimatedTime: '3 min',
    difficulty: 'Fácil',
  },
  {
    slug: 'como-proteger-pdf-com-senha',
    title: 'Como colocar senha em PDF para proteger dados',
    description:
      'Aumente a segurança dos seus documentos adicionando uma criptografia de senha forte.',
    searchIntent: 'como colocar senha em pdf',
    intro:
      'Segurança é prioridade na Unificando. Proteger seus arquivos com senha garante que apenas pessoas autorizadas tenham acesso a informações sensíveis.',
    whenToUse: [
      'Para enviar documentos com dados pessoais ou financeiros.',
      'Para proteger contratos confidenciais antes do compartilhamento.',
      'Para garantir a privacidade de arquivos armazenados na nuvem.',
    ],
    steps: [
      {
        title: 'Envie o PDF que deseja proteger',
        description:
          'O arquivo é processado de forma segura e nunca fica armazenado em nossos servidores.',
      },
      {
        title: 'Defina uma senha forte',
        description:
          'Escolha uma combinação de letras, números e símbolos para garantir a máxima proteção.',
      },
      {
        title: 'Aplique a criptografia',
        description:
          'O sistema aplicará a camada de segurança ao seu documento instantaneamente.',
      },
      {
        title: 'Baixe o PDF protegido',
        description:
          'Seu arquivo agora só poderá ser aberto por quem possuir a senha definida.',
      },
    ],
    commonMistakes: [
      'Esquecer a senha definida (não há como recuperar se você perder).',
      'Usar senhas óbvias como "123456" para documentos importantes.',
    ],
    faqs: [
      {
        question: 'A Unificando tem acesso à minha senha?',
        answer:
          'De forma alguma. O processo de criptografia é automatizado e nós não registramos nenhuma senha digitada.',
      },
    ],
    targetToolSlug: 'proteger-pdf',
    estimatedTime: '1 min',
    difficulty: 'Fácil',
  },
  {
    slug: 'como-redigir-pdf-censurar-conteudo',
    title: 'Como censurar e ocultar informações em PDF',
    description:
      'Aprenda como remover permanentemente informações sensíveis de um documento PDF.',
    searchIntent: 'como censurar pdf',
    intro:
      'Censurar um PDF é o ato de ocultar informações que não devem ser vistas por terceiros, como CPFs, valores bancários ou nomes em documentos públicos.',
    whenToUse: [
      'Para ocultar dados sensíveis em processos públicos.',
      'Para remover informações confidenciais antes de compartilhar um documento.',
      'Para garantir a conformidade com a LGPD.',
    ],
    steps: [
      {
        title: 'Selecione o PDF para censura',
        description:
          'Carregue o arquivo e o sistema abrirá o workspace de edição.',
      },
      {
        title: 'Marque as áreas que deseja ocultar',
        description:
          'Desenhe retângulos pretos sobre os textos ou imagens que devem ser ocultados.',
      },
      {
        title: 'Aplique as alterações',
        description:
          'O sistema removerá de fato o conteúdo por baixo das tarjas pretas, impedindo qualquer recuperação.',
      },
      {
        title: 'Baixe o documento censurado',
        description:
          'Seu arquivo está pronto para ser compartilhado com segurança.',
      },
    ],
    commonMistakes: [
      'Apenas desenhar um retângulo preto no Word (o texto continua lá "por baixo"). Nossa ferramenta remove o dado permanentemente.',
    ],
    faqs: [
      {
        question: 'Dá para remover a tarja depois?',
        answer:
          'Não. Uma vez aplicado o processo de censura, o conteúdo original é destruído por segurança.',
      },
    ],
    targetToolSlug: 'redigir-pdf',
    estimatedTime: '2 min',
    difficulty: 'Médio',
  },
  {
    slug: 'como-adicionar-marca-dagua-em-pdf',
    title: 'Como colocar marca d\'água em PDF online',
    description:
      'Proteja sua propriedade intelectual adicionando textos ou selos personalizados em todas as páginas.',
    searchIntent: 'como colocar marca d\'água em pdf',
    intro:
      'Adicionar uma marca d\'água é essencial para identificar a autoria de um documento, indicar o status (como "Rascunho" ou "Confidencial") ou evitar cópias não autorizadas.',
    whenToUse: [
      'Para identificar documentos oficiais da sua empresa.',
      'Para marcar arquivos como "Cópia não autorizada".',
      'Para adicionar seu nome ou marca em portfólios e propostas.',
    ],
    steps: [
      {
        title: 'Envie seu arquivo PDF',
        description:
          'O documento será carregado para que você possa configurar a marca.',
      },
      {
        title: 'Configure o texto ou imagem',
        description:
          'Escolha o que será escrito, a posição, o tamanho e a transparência da marca.',
      },
      {
        title: 'Gere o documento final',
        description:
          'A Unificando aplicará a marca em todas as páginas de forma uniforme.',
      },
      {
        title: 'Baixe o PDF marcado',
        description:
          'Seu arquivo está protegido e pronto para uso.',
      },
    ],
    commonMistakes: [
      'Usar uma opacidade muito alta que dificulta a leitura do texto original.',
      'Colocar a marca em uma posição que cubra informações vitais.',
    ],
    faqs: [
      {
        question: 'Posso colocar marca d\'água em fotos?',
        answer:
          'Sim, você pode subir uma imagem (logo) para ser usada como marca d\'água no PDF.',
      },
    ],
    targetToolSlug: 'marca-dagua',
    estimatedTime: '2 min',
    difficulty: 'Fácil',
  },
  {
    slug: 'como-comprimir-pdf',
    title: 'Como comprimir PDF para reduzir o tamanho',
    description:
      'Aprenda como diminuir o tamanho de um arquivo PDF para enviar por e-mail, protocolos ou upload online.',
    searchIntent: 'como comprimir pdf',
    intro:
      'Quando um PDF fica pesado demais, ele pode impedir o envio por e-mail, sistemas internos ou formulários com limite de tamanho. Nessas horas, comprimir o arquivo resolve o problema rapidamente.',
    whenToUse: [
      'Para enviar PDF por e-mail sem ultrapassar o limite de anexo.',
      'Para subir documentos em sistemas governamentais ou escolares com limite de tamanho.',
      'Para reduzir o peso de arquivos que possuem muitas imagens ou gráficos.',
    ],
    steps: [
      {
        title: 'Escolha o PDF que está pesado',
        description:
          'Selecione o arquivo que precisa ficar menor. Em geral, documentos com imagens ou digitalizações tendem a ter maior redução com a compressão.',
      },
      {
        title: 'Defina o nível de qualidade',
        description:
          'Use o nível mais adequado ao seu caso. A qualidade média costuma ser o equilíbrio perfeito entre tamanho reduzido e boa leitura.',
      },
      {
        title: 'Processe o arquivo',
        description:
          'Envie o PDF e aguarde alguns instantes enquanto o sistema otimiza o documento para você.',
      },
      {
        title: 'Baixe e revise o resultado',
        description:
          'Depois do download, confira se o texto e as imagens continuam legíveis para o uso que você pretende dar ao arquivo.',
      },
    ],
    commonMistakes: [
      'Escolher a compressão mais agressiva sem necessidade, o que pode afetar a qualidade de imagens detalhadas.',
      'Não revisar o resultado final antes de enviar para terceiros.',
      'Esperar que todo PDF reduza drasticamente, mesmo quando o arquivo já foi otimizado anteriormente.',
    ],
    faqs: [
      {
        question: 'Comprimir PDF prejudica a leitura?',
        answer:
          'Depende do nível escolhido. Na prática, a opção média mantém uma excelente legibilidade e ainda reduz consideravelmente o tamanho do arquivo.',
      },
      {
        question: 'Vale a pena comprimir antes de enviar por e-mail?',
        answer:
          'Com certeza! Essa é uma das situações mais comuns, especialmente quando o anexo original ultrapassa o limite permitido pelo servidor de e-mail.',
      },
    ],
    targetToolSlug: 'comprimir-pdf',
    estimatedTime: '1 min',
    difficulty: 'Fácil',
  },
  {
    slug: 'como-converter-pdf-em-jpg',
    title: 'Como converter PDF em imagens JPG',
    description:
      'Transforme cada página do seu PDF em uma imagem JPG de alta qualidade de forma individual.',
    searchIntent: 'como converter pdf em jpg',
    intro:
      'Converter PDF para JPG é ideal para quando você precisa usar uma página do documento em redes sociais, apresentações de slides ou apenas visualizar sem um leitor de PDF.',
    whenToUse: [
      'Para usar páginas de um PDF em posts do Instagram ou LinkedIn.',
      'Para extrair imagens e fotos que estão dentro de um PDF.',
      'Para facilitar o compartilhamento de páginas únicas via apps de mensagem.',
    ],
    steps: [
      {
        title: 'Envie seu arquivo PDF',
        description:
          'Selecione o documento que você deseja transformar em imagens.',
      },
      {
        title: 'Escolha a qualidade da imagem',
        description:
          'Você pode definir a resolução (DPI) para garantir que os detalhes permaneçam nítidos.',
      },
      {
        title: 'Inicie a conversão',
        description:
          'O sistema da Unificando processará cada página separadamente.',
      },
      {
        title: 'Baixe o arquivo ZIP',
        description:
          'Você receberá todas as páginas convertidas em um único arquivo compactado.',
      },
    ],
    commonMistakes: [
      'Escolher uma resolução muito baixa para documentos que possuem textos pequenos.',
    ],
    faqs: [
      {
        question: 'As imagens ficam com boa qualidade?',
        answer:
          'Sim, você pode configurar o DPI para obter imagens em alta resolução ideais para impressão ou design.',
      },
    ],
    targetToolSlug: 'pdf-para-jpg',
    estimatedTime: '1 min',
    difficulty: 'Fácil',
  },
  {
    slug: 'como-rotacionar-pdf',
    title: 'Como girar páginas de PDF permanentemente',
    description:
      'Corrija a orientação de documentos que foram escaneados de cabeça para baixo ou de lado.',
    searchIntent: 'como rotacionar pdf',
    intro:
      'Documentos digitalizados incorretamente podem dificultar a leitura. Com nossa ferramenta, você pode rotacionar páginas individualmente ou o documento inteiro.',
    whenToUse: [
      'Para corrigir páginas que ficaram na horizontal após o escaneamento.',
      'Para ajustar a orientação de projetos e plantas de arquitetura.',
      'Para deixar todos os documentos de um processo na mesma orientação.',
    ],
    steps: [
      {
        title: 'Carregue o PDF com páginas invertidas',
        description:
          'O sistema mostrará miniaturas de todas as páginas do arquivo.',
      },
      {
        title: 'Gire as páginas desejadas',
        description:
          'Use os botões de rotação para ajustar cada página para a posição correta.',
      },
      {
        title: 'Aplique as mudanças',
        description:
          'A Unificando salvará a nova orientação permanentemente no arquivo.',
      },
      {
        title: 'Baixe o PDF corrigido',
        description:
          'Seu documento agora está pronto para leitura e impressão correta.',
      },
    ],
    commonMistakes: [
      'Girar todas as páginas quando apenas uma precisava de correção.',
    ],
    faqs: [
      {
        question: 'A rotação é definitiva?',
        answer:
          'Sim, ao baixar o arquivo, as páginas estarão na orientação que você definiu.',
      },
    ],
    targetToolSlug: 'rodar-pdf',
    estimatedTime: '1 min',
    difficulty: 'Fácil',
  },
  {
    slug: 'como-organizar-paginas-pdf',
    title: 'Como organizar e reordenar páginas de PDF',
    description:
      'Mude a ordem das páginas, exclua o que não é importante e organize seu documento como quiser.',
    searchIntent: 'como organizar pdf',
    intro:
      'Ter o controle total sobre a estrutura do seu documento é vital. Reordene páginas arrastando-as ou remova páginas em branco e desnecessárias com um clique.',
    whenToUse: [
      'Para colocar a capa no início de um documento unificado.',
      'Para remover páginas de erro ou em branco de um arquivo digitalizado.',
      'Para montar uma sequência lógica em propostas comerciais.',
    ],
    steps: [
      {
        title: 'Selecione o PDF para organização',
        description:
          'As páginas aparecerão como miniaturas que podem ser manipuladas.',
      },
      {
        title: 'Arraste e solte',
        description:
          'Mova as páginas para a posição que você desejar na ordem final.',
      },
      {
        title: 'Remova páginas (se necessário)',
        description:
          'Clique no ícone de lixeira nas miniaturas das páginas que você não quer no arquivo final.',
      },
      {
        title: 'Gere o novo PDF',
        description:
          'A Unificando consolidará sua nova estrutura em um novo arquivo pronto para uso.',
      },
    ],
    commonMistakes: [
      'Excluir uma página importante por engano (confira sempre a prévia antes de gerar).',
    ],
    faqs: [
      {
        question: 'Posso organizar PDFs muito grandes?',
        answer:
          'Sim, nosso sistema lida bem com arquivos de muitas páginas, mantendo a fluidez da organização.',
      },
    ],
    targetToolSlug: 'organizar-pdf',
    estimatedTime: '2 min',
    difficulty: 'Fácil',
  },
  {
    slug: 'como-converter-pdf-em-markdown',
    title: 'Como converter PDF em Markdown para IA e RAG',
    description:
      'Aprenda como transformar documentos PDF em arquivos Markdown estruturados, prontos para uso com LLMs, LangChain, LlamaIndex e pipelines de RAG.',
    searchIntent: 'como converter pdf em markdown',
    intro:
      'Modelos de linguagem e pipelines de RAG trabalham muito melhor com texto puro e bem estruturado do que com PDFs binários. Converter um PDF para Markdown é o primeiro passo para alimentar sistemas de IA com documentos de qualidade.',
    whenToUse: [
      'Para preparar documentos para uso com LangChain, LlamaIndex ou Haystack.',
      'Para criar bases de conhecimento em wikis, Obsidian ou Notion a partir de PDFs.',
      'Para extrair texto estruturado de relatórios, artigos e manuais técnicos.',
      'Para reduzir o custo de tokens ao enviar documentos para LLMs (Markdown é mais compacto que HTML).',
    ],
    steps: [
      {
        title: 'Envie o arquivo PDF',
        description:
          'Selecione o documento que você quer converter. A ferramenta funciona com PDFs de texto digital — manuais, relatórios, artigos, contratos e similares.',
      },
      {
        title: 'Aguarde a extração',
        description:
          'O sistema analisa o tamanho de cada elemento de texto para identificar títulos, subtítulos e parágrafos automaticamente.',
      },
      {
        title: 'Baixe o arquivo .md',
        description:
          'O resultado é um arquivo Markdown com # para títulos, ## para subtítulos, - para listas e --- separando as páginas. Pronto para usar em qualquer ferramenta.',
      },
    ],
    commonMistakes: [
      'Tentar converter PDFs escaneados (fotos de papel) — a ferramenta extrai texto digital embutido no arquivo, não realiza OCR.',
      'Esperar uma reprodução visual perfeita — o foco é texto estruturado para uso em IA, não design.',
      'Não revisar a detecção de títulos em PDFs com fontes personalizadas ou tamanhos muito semelhantes.',
    ],
    faqs: [
      {
        question: 'Por que Markdown é melhor que PDF para IA?',
        answer:
          'PDFs são formatos binários opacos para LLMs. Markdown é texto puro com marcadores semânticos (#, -, **) que os modelos interpretam nativamente. Isso melhora a qualidade das respostas em sistemas de RAG e reduz o consumo de tokens.',
      },
      {
        question: 'O arquivo funciona diretamente com LangChain?',
        answer:
          'Sim. O arquivo .md gerado é compatível com o UnstructuredMarkdownLoader e o MarkdownTextSplitter do LangChain, além de parsers equivalentes no LlamaIndex e Haystack.',
      },
      {
        question: 'Como os títulos são detectados?',
        answer:
          'A ferramenta analisa o tamanho de fonte de cada linha em relação à mediana do documento. Linhas com fonte significativamente maior viram #, ## ou ### proporcionalmente.',
      },
      {
        question: 'Funciona com PDFs em português?',
        answer:
          'Sim, o processo de extração não depende do idioma — funciona para qualquer texto digital embutido no PDF.',
      },
    ],
    targetToolSlug: 'pdf-para-markdown',
    estimatedTime: '1 min',
    difficulty: 'Fácil',
  },
  {
    slug: 'como-converter-pdf-em-txt',
    title: 'Como converter PDF em TXT e extrair só o texto',
    description:
      'Aprenda como transformar um PDF em arquivo TXT para copiar conteúdo, fazer leitura simples ou reutilizar o texto em outros sistemas.',
    searchIntent: 'como converter pdf em txt',
    intro:
      'Converter PDF em TXT é uma das formas mais rápidas de extrair apenas o conteúdo textual de um documento, sem layout, imagens ou elementos visuais. É útil quando o foco está em leitura, cópia, revisão ou reaproveitamento do texto em outras ferramentas.',
    whenToUse: [
      'Para copiar rapidamente o conteúdo de um PDF para outro editor.',
      'Para gerar uma versão leve e simples de leitura do documento.',
      'Para reaproveitar o texto em IA, buscas internas ou automações.',
      'Para remover o peso visual do PDF e ficar só com o conteúdo escrito.',
    ],
    steps: [
      {
        title: 'Selecione o arquivo PDF',
        description:
          'Escolha o documento que contém texto digital embutido. Relatórios, contratos e manuais costumam funcionar muito bem.',
      },
      {
        title: 'Envie para a ferramenta de PDF para TXT',
        description:
          'A ferramenta faz a extração textual e ignora elementos visuais como layout, bordas e imagens.',
      },
      {
        title: 'Revise a prévia do texto',
        description:
          'Antes de baixar, você pode conferir o conteúdo extraído e até copiar o texto diretamente da tela.',
      },
      {
        title: 'Baixe o arquivo .txt',
        description:
          'Faça o download do TXT final para usar em editores, sistemas internos, buscas ou fluxos com IA.',
      },
    ],
    commonMistakes: [
      'Tentar extrair texto de PDFs escaneados ou compostos apenas por imagem, que exigem OCR.',
      'Esperar que o arquivo TXT preserve a formatação visual do PDF original.',
      'Não revisar quebras de linha quando o documento tem colunas ou diagramação mais complexa.',
    ],
    faqs: [
      {
        question: 'PDF para TXT mantém imagens e tabelas?',
        answer:
          'Não. O objetivo da conversão é extrair apenas o texto do PDF. Imagens, estilos e estrutura visual não são mantidos no arquivo TXT.',
      },
      {
        question: 'Funciona com PDF escaneado?',
        answer:
          'Não nesta versão. PDFs escaneados são basicamente imagens e precisam de OCR para transformar a imagem em texto editável.',
      },
      {
        question: 'Posso copiar o texto antes de baixar?',
        answer:
          'Sim. A ferramenta mostra uma prévia do conteúdo extraído e permite copiar o texto diretamente da interface.',
      },
    ],
    targetToolSlug: 'pdf-para-txt',
    estimatedTime: '1 min',
    difficulty: 'Fácil',
  },
  {
    slug: 'como-numerar-paginas-de-um-pdf',
    title: 'Como numerar páginas de um PDF online',
    description:
      'Veja como adicionar numeração automática no cabeçalho ou rodapé do PDF para uso jurídico, acadêmico ou administrativo.',
    searchIntent: 'como numerar paginas de um pdf',
    intro:
      'Numerar páginas em PDF ajuda a organizar documentos longos, facilita referências internas e deixa o arquivo mais adequado para protocolos, petições, trabalhos acadêmicos e processos administrativos.',
    whenToUse: [
      'Para preparar documentos jurídicos com paginação clara.',
      'Para organizar TCCs, apostilas e materiais acadêmicos.',
      'Para facilitar citações e conferência em relatórios extensos.',
      'Para padronizar PDFs administrativos antes do envio.',
    ],
    steps: [
      {
        title: 'Defina onde a numeração deve aparecer',
        description:
          'Escolha se os números ficarão no cabeçalho ou no rodapé do documento, conforme o seu padrão de uso.',
      },
      {
        title: 'Escolha o alinhamento e o número inicial',
        description:
          'Você pode posicionar os números à esquerda, ao centro ou à direita e decidir em qual número a contagem começa.',
      },
      {
        title: 'Envie o arquivo PDF',
        description:
          'Selecione o documento que precisa de paginação. O sistema aplicará a numeração automaticamente em todas as páginas.',
      },
      {
        title: 'Baixe o PDF numerado',
        description:
          'Depois do processamento, faça o download do novo arquivo já pronto para compartilhar, imprimir ou protocolar.',
      },
    ],
    commonMistakes: [
      'Escolher uma posição que pode conflitar com conteúdo existente no topo ou no rodapé.',
      'Começar a contagem no número errado quando o documento é parte de um arquivo maior.',
      'Não revisar o resultado final em PDFs que já possuem rodapé ou cabeçalho próprio.',
    ],
    faqs: [
      {
        question: 'Posso começar a numeração em outro número?',
        answer:
          'Sim. A ferramenta permite escolher o número inicial, o que é útil quando o PDF faz parte de uma sequência maior.',
      },
      {
        question: 'Os números aparecem em todas as páginas?',
        answer:
          'Sim. A paginação é aplicada automaticamente em todas as páginas do arquivo processado.',
      },
      {
        question: 'O conteúdo original do PDF é alterado?',
        answer:
          'O conteúdo do documento é preservado. A ferramenta apenas adiciona a numeração escolhida no cabeçalho ou no rodapé.',
      },
    ],
    targetToolSlug: 'numerar-paginas',
    estimatedTime: '1 min',
    difficulty: 'Fácil',
  },
  {
    slug: 'como-extrair-paginas-do-pdf',
    title: 'Como extrair páginas do PDF em arquivos separados',
    description:
      'Aprenda como selecionar páginas específicas de um PDF e baixar cada uma como arquivo individual dentro de um ZIP.',
    searchIntent: 'como extrair paginas do pdf',
    intro:
      'Extrair páginas do PDF é ideal quando você quer separar partes específicas de um documento sem levar o arquivo inteiro. Em vez de gerar um único PDF menor, essa opção cria um PDF individual para cada página selecionada.',
    whenToUse: [
      'Para separar anexos ou páginas específicas de um processo.',
      'Para enviar páginas isoladas sem compartilhar o documento completo.',
      'Para organizar laudos, comprovantes ou capítulos em arquivos independentes.',
      'Para montar um pacote com páginas escolhidas em PDFs separados.',
    ],
    steps: [
      {
        title: 'Informe as páginas que deseja extrair',
        description:
          'Use números avulsos e intervalos como 1, 3, 7-9 para selecionar exatamente as páginas que devem virar arquivos separados.',
      },
      {
        title: 'Envie o PDF original',
        description:
          'Selecione o documento completo. O sistema usará esse arquivo apenas como base para criar cópias individuais das páginas escolhidas.',
      },
      {
        title: 'Aguarde a geração dos arquivos',
        description:
          'Cada página selecionada é convertida em um PDF próprio, com nome organizado automaticamente.',
      },
      {
        title: 'Baixe o arquivo ZIP',
        description:
          'O resultado final é um arquivo compactado contendo todos os PDFs individuais, prontos para abrir, compartilhar ou arquivar.',
      },
    ],
    commonMistakes: [
      'Confundir esta ferramenta com dividir PDF, que normalmente gera um único arquivo com várias páginas selecionadas.',
      'Digitar páginas fora do total disponível no documento.',
      'Não revisar a ordem informada quando as páginas precisam seguir uma sequência específica.',
    ],
    faqs: [
      {
        question: 'Cada página vira um PDF separado?',
        answer:
          'Sim. A ferramenta cria um PDF individual para cada página selecionada e entrega tudo junto em um arquivo ZIP.',
      },
      {
        question: 'Posso extrair páginas não sequenciais?',
        answer:
          'Sim. Você pode combinar páginas avulsas e intervalos, como 1, 4, 8-10.',
      },
      {
        question: 'Qual a diferença entre extrair páginas e dividir PDF?',
        answer:
          'Dividir PDF costuma gerar um novo documento com várias páginas selecionadas juntas. Extrair páginas, neste caso, gera um arquivo separado para cada página escolhida.',
      },
    ],
    targetToolSlug: 'extrair-paginas',
    estimatedTime: '2 min',
    difficulty: 'Fácil',
  },
  {
    slug: 'como-converter-pdf-em-png',
    title: 'Como converter PDF em PNG com fundo transparente',
    description:
      'Extraia páginas do seu PDF em formato PNG, mantendo a transparência e alta qualidade visual.',
    searchIntent: 'como converter pdf em png',
    intro:
      'O formato PNG é superior ao JPG quando se trata de transparências e nitidez de bordas. Converter PDF para PNG na Unificando garante que seus gráficos e logos fiquem perfeitos para qualquer uso digital.',
    whenToUse: [
      'Para extrair logos ou ícones de um manual em PDF.',
      'Para usar páginas do PDF em layouts de design que exigem transparência.',
      'Para garantir a melhor qualidade em fundos coloridos.',
    ],
    steps: [
      {
        title: 'Selecione o arquivo PDF',
        description:
          'Escolha o documento do qual você quer extrair as imagens PNG.',
      },
      {
        title: 'Escolha a opção de transparência',
        description:
          'O sistema permite gerar imagens com o fundo transparente ou branco sólido.',
      },
      {
        title: 'Processamento de alta fidelidade',
        description:
          'Aguarde enquanto as páginas são renderizadas em alta definição.',
      },
      {
        title: 'Baixe o ZIP',
        description:
          'Receba todas as suas imagens PNG organizadas em um único arquivo compactado.',
      },
    ],
    commonMistakes: [
      'Usar PNG quando o JPG seria suficiente (o arquivo PNG tende a ser maior em tamanho de KB).',
    ],
    faqs: [
      {
        question: 'O fundo realmente fica transparente?',
        answer:
          'Sim! Se o seu PDF não tiver uma cor de fundo definida, nossa ferramenta preservará a transparência no arquivo PNG final.',
      },
    ],
    targetToolSlug: 'pdf-para-png',
    estimatedTime: '1 min',
    difficulty: 'Fácil',
  },
]

export function getTutorial(slug: string): TutorialDefinition {
  const tutorial = tutorials.find((item) => item.slug === slug)

  if (!tutorial) {
    throw new Error(`Tutorial not found: ${slug}`)
  }

  return tutorial
}
