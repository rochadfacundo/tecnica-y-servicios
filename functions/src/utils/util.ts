/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";


export const fetchAllPaginated = async (
  url: string,
  token: string,
  extraParams: Record<string, any> = {}
): Promise<any[]> => {
  const pageSize = 100;
  let page = 1;
  let resultados: any[] = [];
  let hayMas = true;

  while (hayMas) {
    const response = await axios.get(url, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      params: {
        page,
        page_size: pageSize,
        ...extraParams,
      },
    });

    const data = response.data;
    resultados = [...resultados, ...data];
    hayMas = data.length >= pageSize;
    page++;
  }

  return resultados;
};
