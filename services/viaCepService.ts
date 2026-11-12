import { Address } from '../types';

export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

/**
 * Busca endereço a partir de um CEP via API ViaCEP.
 * @param cep CEP com ou sem formatação (ex: "01310-100" ou "01310100")
 * @throws Error se o CEP for inválido ou não encontrado
 */
export const fetchAddressByCep = async (cep: string): Promise<Address> => {
  const cleanCep = cep.replace(/\D/g, '');

  if (cleanCep.length !== 8) {
    throw new Error('CEP deve conter 8 dígitos');
  }

  const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Erro ao conectar com o serviço de CEP');
  }

  const data: ViaCepResponse = await response.json();

  if (data.erro) {
    throw new Error('CEP não encontrado. Verifique e tente novamente.');
  }

  return {
    cep: data.cep,
    logradouro: data.logradouro,
    bairro: data.bairro,
    localidade: data.localidade,
    uf: data.uf,
  };
};
