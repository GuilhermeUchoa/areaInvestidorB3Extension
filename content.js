const aplicarScriptEmTodasTabelas = () => {
    const tabelas = document.querySelectorAll('table');

    // Criar um elemento fixo na tela para mostrar o total geral de todas as tabelas
    let totalGeralElement = document.getElementById('total-geral-metas');
    if (!totalGeralElement) {
        totalGeralElement = document.createElement('div');
        totalGeralElement.id = 'total-geral-metas';
        totalGeralElement.style.position = 'fixed';
        totalGeralElement.style.bottom = '20px';
        totalGeralElement.style.right = '20px';
        totalGeralElement.style.padding = '12px 18px';
        totalGeralElement.style.backgroundColor = '#f8f9fa';
        totalGeralElement.style.border = '2px solid #000';
        totalGeralElement.style.borderRadius = '8px';
        totalGeralElement.style.boxShadow = '2px 2px 10px rgba(0, 0, 0, 0.2)';
        totalGeralElement.style.fontSize = '18px';
        totalGeralElement.style.fontWeight = 'bold';
        totalGeralElement.style.textAlign = 'center';
        totalGeralElement.style.zIndex = '9999';
        totalGeralElement.style.color = 'black';
        document.body.appendChild(totalGeralElement);
    }

    const atualizarTotalGeral = () => {
        let totalGeral = 0;
        document.querySelectorAll('[id^="total-metas-"]').forEach(el => {
            totalGeral += parseFloat(el.textContent.replace('%', '')) || 0;
        });

        totalGeralElement.textContent = `Total Geral: ${totalGeral.toFixed(2)}%`;

        // Se ultrapassar 100%, muda a cor para vermelho
        totalGeralElement.style.color = totalGeral > 100 ? 'red' : 'black';
    };

    const totalAcoesElements = document.getElementsByClassName('me-3 table__right-information');
    let totalAcoes = 0;

    Array.from(totalAcoesElements).forEach(element => {
        const valor = parseFloat(element.textContent.replace('Total: R$', '').replace('.', '').replace(',', '.')) || 0;
        totalAcoes += valor;
    });

    tabelas.forEach((tabela, tabelaIndex) => {
        if (tabela) {
            const cabecalho = tabela.querySelector('thead tr');
            if (cabecalho) {
                ['% do Total', 'Metas', 'Porcentagem Faltante', 'Falta para Meta', 'Cotas para Comprar'].forEach(titulo => {
                    const th = document.createElement('th');
                    th.textContent = titulo;
                    th.style.backgroundColor = '#343a40';
                    th.style.color = 'white';
                    th.style.padding = '10px';
                    th.style.textAlign = 'center';
                    cabecalho.appendChild(th);
                });


                const nomeTabelaElement = tabela.parentElement.parentElement.querySelector('#left_info_tabela-extrato_top').textContent.trim()

                const linhas = tabela.querySelectorAll('tbody tr');
                const storageKey = `metas_tabela_${nomeTabelaElement.replace(/\s+/g, '_')}`;

                const rodape = document.createElement('tr');
                rodape.innerHTML = `
                    <td colspan="8" style="font-weight: bold; text-align: right; padding: 10px;">Total Metas:</td>
                    <td id="total-metas-${tabelaIndex}" style="font-weight: bold; text-align: center; color: black;">0%</td>
                    <td colspan="2"></td>
                `;
                tabela.querySelector('tbody').appendChild(rodape);

                const carregarMetas = () => {
                    return JSON.parse(localStorage.getItem(storageKey) || '{}');
                };


                const salvarMeta = (nomeAtivo, meta) => {
                    const metas = carregarMetas();
                    metas[nomeAtivo] = meta;  // Agora salvamos usando o nome do ativo
                    localStorage.setItem(storageKey, JSON.stringify(metas));
                    atualizarTotalMetas();
                };

                const atualizarTotalMetas = () => {
                    let totalMetas = 0;
                    linhas.forEach(linha => {
                        const metaInput = linha.querySelector('input');
                        if (metaInput) {
                            totalMetas += parseFloat(metaInput.value) || 0;
                        }
                    });

                    const totalMetasElement = document.getElementById(`total-metas-${tabelaIndex}`);
                    totalMetasElement.textContent = `${totalMetas.toFixed(2)}%`;
                    totalMetasElement.style.color = totalMetas > 100 ? 'red' : 'black';

                    // Atualiza o total geral
                    atualizarTotalGeral();
                };

                linhas.forEach((linha, index) => {
                    const tdPorcentagem = document.createElement('td');
                    const tdMeta = document.createElement('input');
                    const tdPorcentagemFaltante = document.createElement('td');
                    const tdFaltaMeta = document.createElement('td');
                    const tdCotasParaComprar = document.createElement('td');

                    tdMeta.type = 'number';
                    tdMeta.placeholder = 'Meta %';
                    const nomeAtivo = linha.querySelector('td:nth-child(2)').textContent.trim(); // Obtém o nome do ativo
                    tdMeta.value = carregarMetas()[nomeAtivo] || '';
                    tdMeta.style.width = '70px';
                    tdMeta.style.textAlign = 'center';
                    tdMeta.style.border = '1px solid #ced4da';
                    tdMeta.style.borderRadius = '5px';
                    tdMeta.style.padding = '5px';
                    tdMeta.style.backgroundColor = '#f8f9fa';
                    tdMeta.style.position = 'relative';
                    tdMeta.style.top = '12px'
                    tdMeta.addEventListener('input', () => {
                        salvarMeta(nomeAtivo, tdMeta.value);
                    });

                    linha.appendChild(tdPorcentagem);
                    linha.appendChild(tdMeta);
                    linha.appendChild(tdPorcentagemFaltante);
                    linha.appendChild(tdFaltaMeta);
                    linha.appendChild(tdCotasParaComprar);

                    let valor = parseFloat(linha.querySelector('td:nth-child(7)').textContent.replace('R$', '').replace('.', '').replace(',', '.')) || 0;
                    let precoFechamento = parseFloat(linha.querySelector('td:nth-child(6)').textContent.replace('R$', '').replace('.', '').replace(',', '.')) || 1;
                    

                    if(nomeTabelaElement.replace(/\s+/g, '_') == 'EMPRÉSTIMO_DE_ATIVOS'){

                        valor = parseFloat(linha.querySelector('td:nth-child(9)').textContent.replace('R$', '').replace('.', '').replace(',', '.')) || 0;
                        precoFechamento = parseFloat(linha.querySelector('td:nth-child(8)').textContent.replace('R$', '').replace('.', '').replace(',', '.')) || 1;
                    }



                    const porcentagemAtual = ((valor / totalAcoes) * 100).toFixed(2);
                    tdPorcentagem.textContent = porcentagemAtual;

                    const metaPorcentagem = parseFloat(tdMeta.value) || 0;

                    const porcentagemFaltante = (metaPorcentagem - porcentagemAtual).toFixed(2);
                    tdPorcentagemFaltante.textContent = porcentagemFaltante;

                    const valorFaltante = ((porcentagemFaltante / 100) * totalAcoes).toFixed(2);
                    tdFaltaMeta.textContent = `R$ ${valorFaltante}`;

                    const cotasParaComprar = (valorFaltante / precoFechamento).toFixed(2);
                    if (cotasParaComprar > 0){

                        tdCotasParaComprar.textContent = Math.round(cotasParaComprar);
                    }else{
                        tdCotasParaComprar.textContent = ''
                    }

                    // Centralizar as células de valores numéricos
                    [tdPorcentagem, tdPorcentagemFaltante, tdFaltaMeta, tdCotasParaComprar].forEach(td => {
                        td.style.textAlign = 'center';
                        td.style.padding = '8px';
                    });
                });

                atualizarTotalMetas();
            }
        }
    });

    // Atualiza o total geral na inicialização
    atualizarTotalGeral();
};

aplicarScriptEmTodasTabelas();
