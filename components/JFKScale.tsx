import React, { useState, useMemo, useRef, forwardRef } from 'react';

// ==========================================
// 🧠 DADOS E CONFIGURAÇÃO DA ESCALA
// ==========================================

const escalaJFKConfig = {
    titulo: 'JFK Emergence Scale',
    descricao: 'Escala de Emergência de Consciência (Máx. 20 pts)',
    itens: [
      { id: 'arousal', label: '1. Arousal (Estado de Alerta)', max: 4, 
        opcoes: [
          { texto: '4 – Alerta sustentado e responsivo', valor: 4 },
          { texto: '3 – Alerta intermitente', valor: 3 },
          { texto: '2 – Acorda com estímulo, mas não mantém alerta', valor: 2 },
          { texto: '1 – Acorda apenas com estímulo intenso', valor: 1 },
          { texto: '0 – Não desperta', valor: 0 },
        ]
      },
      { id: 'audicao', label: '2. Audição / Compreensão', max: 4,
        opcoes: [
          { texto: '4 – Segue comandos consistentes', valor: 4 },
          { texto: '3 – Segue comandos inconsistentes', valor: 3 },
          { texto: '2 – Localiza som', valor: 2 },
          { texto: '1 – Reage ao som sem localização', valor: 1 },
          { texto: '0 – Nenhuma resposta auditiva', valor: 0 },
        ]
      },
      { id: 'visao', label: '3. Visão', max: 4,
        opcoes: [
          { texto: '4 – Reconhece pessoas/objetos', valor: 4 },
          { texto: '3 – Rastreamento visual consistente', valor: 3 },
          { texto: '2 – Rastreamento intermitente', valor: 2 },
          { texto: '1 – Fixação breve', valor: 1 },
          { texto: '0 – Nenhuma resposta visual', valor: 0 },
        ]
      },
      { id: 'comunicacao', label: '4. Comunicação', max: 4,
        opcoes: [
          { texto: '4 – Comunicação funcional (SIM/NÃO correta)', valor: 4 },
          { texto: '3 – Comunicação não funcional intencional', valor: 3 },
          { texto: '2 – Vocalizações intencionais', valor: 2 },
          { texto: '1 – Sons não intencionais', valor: 1 },
          { texto: '0 – Ausência de vocalização', valor: 0 },
        ]
      },
      { id: 'motricidade', label: '5. Motricidade Global', max: 4,
        opcoes: [
          { texto: '4 – Ações motoras funcionais (uso adequado de objeto)', valor: 4 },
          { texto: '3 – Movimentos dirigidos / intencionais', valor: 3 },
          { texto: '2 – Localiza dor', valor: 2 },
          { texto: '1 – Retira ao estímulo doloroso', valor: 1 },
          { texto: '0 – Nenhuma resposta motora', valor: 0 },
        ]
      },
    ],
    refOrder: ['arousal', 'audicao', 'visao', 'comunicacao', 'motricidade'],
  };

// ==========================================
// 🧮 LÓGICA DE NEGÓCIO (INTERPRETAÇÃO)
// ==========================================

const getInterpretacaoJFK = (total: number) => {
  if (total >= 16) {
    return { texto: 'Alta Consciência (16-20)', cor: 'text-green-400', icone: '✅', bg: 'bg-green-400' };
  }
  if (total >= 8) {
    return { texto: 'Consciência Mínima/Emergência (8-15)', cor: 'text-yellow-400', icone: '⚠️', bg: 'bg-yellow-400' };
  }
  return { texto: 'Coma / Não Responsivo (0-7)', cor: 'text-red-400', icone: '🔴', bg: 'bg-red-400' };
};

// ==========================================
// ⚛️ COMPONENTES VISUAIS (UI)
// ==========================================

// Ícone de Check Simples (Formulário)
const CheckIcon = () => (
  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

// Ícone de Voltar
const BackIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

// Componente de Card de Pergunta (Otimizado com forwardRef para scroll)
const QuestionCard = forwardRef<HTMLDivElement, { label: string, id: string, valor: number | null, onChange: (val: number | null) => void, opcoes: any[], maxPontos: number }>(({ label, id, valor, onChange, opcoes, maxPontos }, ref) => {
  return (
    <div ref={ref} className="bg-slate-800 p-5 rounded-xl shadow-lg border border-slate-700 transition-all duration-300 hover:border-slate-600">
      <div className="flex justify-between items-start mb-3">
        <div>
          <label className="block text-base font-semibold text-gray-100">
            {label}
          </label>
          <p className="text-xs text-gray-400 mt-1">Pontuação Máxima: {maxPontos}</p>
        </div>
        {valor != null && <CheckIcon />} 
      </div>
      
      <select
        value={valor === null ? '' : valor}
        onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
        className="w-full bg-slate-900 border border-slate-600 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
      >
        <option value="">Selecione a resposta...</option>
        {opcoes.map((opt, index) => (
          <option key={index} value={opt.valor}>
            {opt.texto} ({opt.valor} pts)
          </option>
        ))}
      </select>
    </div>
  );
});

// ==========================================
// 🚀 APLICAÇÃO PRINCIPAL
// ==========================================

interface JFKScaleProps {
  onSaveScore: (data: { scaleName: string; score: number; interpretation: string; }) => void;
}

export const JFKScale: React.FC<JFKScaleProps> = ({ onSaveScore }) => {
  // --- Estado ---
  const [tela, setTela] = useState<'lista' | 'form' | 'resultado'>('lista');
  
  // Estado para as respostas. 
  const [respostas, setRespostas] = useState<Record<string, number>>({});
  
  // Histórico da última avaliação
  const [ultimoResultado, setUltimoResultado] = useState<any>(null);
  
  // Mensagem de erro
  const [erro, setErro] = useState<string | null>(null);

  // Refs para scroll
  const refs: Record<string, React.MutableRefObject<HTMLDivElement | null>> = {
    arousal: useRef(null), audicao: useRef(null), visao: useRef(null), comunicacao: useRef(null), motricidade: useRef(null),
  };
  const configAtual = escalaJFKConfig;
  const maxScore = configAtual.itens.reduce((sum, item) => sum + item.max, 0);


  // --- Computados ---
  const ultimaInterpretacao = useMemo(
    () => ultimoResultado ? getInterpretacaoJFK(ultimoResultado.total) : null,
    [ultimoResultado]
  );
  
  const pontuacaoTotalCalculada = useMemo(() => {
    const ids = configAtual.itens.map(i => i.id);
    return ids.reduce((acc, id) => acc + (respostas[id] || 0), 0);
  }, [respostas]);
  
  const interpretacaoAtual = useMemo(() => getInterpretacaoJFK(pontuacaoTotalCalculada), [pontuacaoTotalCalculada]);

  // --- Handlers ---

  const iniciarNovaAvaliacao = () => {
    setRespostas({});
    setErro(null);
    setTela('form');
  };

  const handleSelectChange = (id: string, valor: number | null) => {
    setRespostas(prev => ({ ...prev, [id]: valor || 0 }));
    
    // Lógica de Scroll Automático (Fluido)
    const order = configAtual.refOrder;
    const currentIndex = order.indexOf(id);
    const nextId = order[currentIndex + 1];
    
    if (nextId && refs[nextId] && refs[nextId].current && valor != null) {
      setTimeout(() => {
        refs[nextId].current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 150);
    }
  };

  const calcularResultado = () => {
    // Validação
    const idsPerguntas = configAtual.itens.map(i => i.id);
    const faltamRespostas = idsPerguntas.some(id => respostas[id] == null);

    if (faltamRespostas) {
      setErro(`Por favor, responda a todos os ${idsPerguntas.length} itens da escala JFK Emergence para obter um resultado preciso.`);
      return;
    }

    setUltimoResultado({
      total: pontuacaoTotalCalculada,
    });
    
    setTela('resultado');
  };

  const salvarEFechar = () => {
    if (ultimoResultado) {
        onSaveScore({
            scaleName: configAtual.titulo,
            score: ultimoResultado.total,
            interpretation: interpretacaoAtual.texto
        });
    }
    setTela('lista');
    setRespostas({});
    setErro(null);
  };

  // --- Renderização das Telas ---

  // 1. TELA LISTA (Dashboard)
  if (tela === 'lista') {
    return (
      <div className="w-full max-w-md mx-auto p-4 bg-slate-900 min-h-[600px] text-gray-100 font-sans rounded-xl shadow-2xl border border-slate-800">
        <div className="bg-slate-800 p-6 rounded-xl shadow-inner mb-6 text-center border border-slate-700">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Última Avaliação JFK Emergence</h2>
          
          {ultimoResultado ? (
            <>
              <div className="text-5xl font-extrabold text-white mb-1">{ultimoResultado.total}</div>
              <p className="text-xs text-gray-400 mb-4">Pontuação Total (Máx. {maxScore})</p>
              <div className={`inline-flex items-center px-4 py-2 rounded-full ${ultimaInterpretacao.cor.replace('text', 'bg')} bg-opacity-20 border ${ultimaInterpretacao.cor.replace('text', 'border')}`}>
                <span className="text-xl mr-2">{ultimaInterpretacao.icone}</span>
                <span className={`font-bold ${ultimaInterpretacao.cor}`}>{ultimaInterpretacao.texto}</span>
              </div>
            </>
          ) : (
            <div className="text-gray-500 py-4 italic">Nenhuma avaliação registrada hoje.</div>
          )}
        </div>

        <div className="space-y-3">
          <button 
            onClick={iniciarNovaAvaliacao}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all transform hover:scale-[1.02] flex items-center justify-center group"
          >
            Registrar Nova Avaliação JFK Emergence
          </button>
        </div>
      </div>
    );
  }

  // 2. TELA FORMULÁRIO
  if (tela === 'form') {
    return (
      <div className="w-full max-w-md mx-auto p-4 bg-slate-900 min-h-[600px] text-gray-100 rounded-xl shadow-2xl border border-slate-800 flex flex-col">
        
        {/* Header */}
        <div className="flex items-center mb-6 pb-4 border-b border-slate-800">
          <button onClick={() => setTela('lista')} className="mr-4 p-2 hover:bg-slate-800 rounded-full transition-colors text-gray-400 hover:text-white">
            <BackIcon />
          </button>
          <div>
            <h2 className="text-lg font-bold text-white leading-tight">{configAtual.titulo}</h2>
            <p className="text-xs text-gray-500">{configAtual.descricao}</p>
          </div>
        </div>

        {/* Lista de Perguntas */}
        <div className="flex-1 space-y-4 overflow-y-auto pr-1 pb-20 scrollbar-hide">
          {configAtual.itens.map((item, index) => {
            return (
              <QuestionCard
                key={item.id}
                ref={refs[item.id]}
                label={`${index + 1}. ${item.label}`}
                id={item.id}
                valor={respostas[item.id]}
                onChange={(val) => handleSelectChange(item.id, val)}
                opcoes={item.opcoes}
                maxPontos={item.max}
              />
            );
          })}
        </div>

        {/* Footer Fixo */}
        <div className="sticky bottom-0 left-0 right-0 pt-4 bg-gradient-to-t from-slate-900 to-transparent">
          {erro && (
            <div className="mb-3 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg text-red-200 text-xs text-center animate-pulse">
              {erro}
            </div>
          )}
          <button
            onClick={calcularResultado}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-xl transition-colors text-lg"
          >
            Calcular Pontuação (Total: {pontuacaoTotalCalculada})
          </button>
        </div>
      </div>
    );
  }

  // 3. TELA RESULTADO
  if (tela === 'resultado' && ultimoResultado) {
    return (
      <div className="w-full max-w-md mx-auto p-4 bg-slate-900 min-h-[600px] text-gray-100 rounded-xl shadow-2xl border border-slate-800 flex flex-col">
        <div className="flex items-center mb-6">
          <button onClick={() => setTela('form')} className="mr-4 p-2 hover:bg-slate-800 rounded-full transition-colors text-gray-400 hover:text-white">
            <BackIcon />
          </button>
          <h2 className="text-xl font-bold text-white">Resultado {configAtual.titulo}</h2>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center -mt-10">
          <div className="w-40 h-40 rounded-full bg-slate-800 border-4 border-slate-700 flex items-center justify-center mb-6 shadow-2xl relative">
            <div className="text-center">
              <span className="block text-6xl font-black text-white">{ultimoResultado.total}</span>
              <span className="text-xs text-gray-400 font-medium">PONTOS (Máx. {maxScore})</span>
            </div>
            <div className="absolute -bottom-2 bg-slate-900 rounded-full p-2 border border-slate-700 shadow-lg text-2xl">
              {interpretacaoAtual.icone}
            </div>
          </div>

          <div className={`w-full p-6 rounded-2xl ${interpretacaoAtual.bg} bg-opacity-10 border ${interpretacaoAtual.cor.replace('text', 'border')} text-center mb-6`}>
            <h3 className={`text-2xl font-bold ${interpretacaoAtual.cor} mb-1`}>
              {interpretacaoAtual.texto}
            </h3>
            <p className="text-sm text-gray-400 opacity-80">Classificação do Nível de Consciência</p>
          </div>

          {/* Detalhes da Interpretação (Regras) */}
          <div className="w-full bg-slate-800 rounded-xl p-5 text-sm text-gray-400 border border-slate-700">
            <h4 className="font-bold text-gray-200 mb-3 border-b border-slate-700 pb-2">Interpretação Rápida</h4>
            <ul className="space-y-2">
              <li className="flex justify-between"><span>Alta Consciência:</span> <span className="font-mono text-green-400 font-bold">16 – 20</span></li>
              <li className="flex justify-between"><span>Consciência Mínima:</span> <span className="font-mono text-yellow-400 font-bold">8 – 15</span></li>
              <li className="flex justify-between"><span>Coma/Não Responsivo:</span> <span className="font-mono text-red-400 font-bold">0 – 7</span></li>
            </ul>
          </div>
        </div>

        <button
          onClick={salvarEFechar}
          className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transition-colors"
        >
          Salvar e Concluir
        </button>
      </div>
    );
  }

  return null;
}