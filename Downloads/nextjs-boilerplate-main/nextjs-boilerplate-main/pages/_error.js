function Error({ statusCode }) {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>
        {statusCode
          ? `Erro ${statusCode} no servidor`
          : 'Erro no cliente'}
      </h1>
      <p>
        {statusCode
          ? 'Ocorreu um erro ao processar sua requisição.'
          : 'Ocorreu um erro no navegador.'}
      </p>
    </div>
  );
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;





