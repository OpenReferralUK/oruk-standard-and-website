'use client'

import { useState } from 'react'
import styles from './APIRequest.module.css'
import Columns from '@/components/Columns'
//import JSONLiteral from '@/components/JSONLiteral'
import Spinner from '@/components/Spinner'
import { isHttpUrl } from '@/utilities/isHttpUrl'

const RESPONSE_STATUS = {
  INITIAL: 'initial',
  PENDING: 'pending',
  SUCCESS: 'success',
  ERROR: 'error'
}

interface APIRequestProps {
  src: string
  exampleId?: string
  apiPath: string
}

export const APIRequest = ({ src, exampleId, apiPath }: APIRequestProps) => {
  const [status, setStatus] = useState(RESPONSE_STATUS.INITIAL)
  const [response, setResponse] = useState<unknown>(null)

  const setStatusPending = () => setStatus(RESPONSE_STATUS.PENDING)
  const setStatusSuccess = () => setStatus(RESPONSE_STATUS.SUCCESS)
  const setStatusError = () => setStatus(RESPONSE_STATUS.ERROR)

  const dispatchRequest = (q: string) => {
    setStatusPending()
    // console.log('requesting ' + q)
    fetchData(q)
  }
  const fetchData = async (q: string) => {
    // Guarded at the point of use, not only at the form: this value arrives
    // from the validator response and need not have come from our own input.
    if (!isHttpUrl(q)) {
      setStatusError()
      return
    }
    try {
      const response = await fetch(q)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()

      setStatusSuccess()
      setResponse(data)
    } catch (error) {
      setStatusError()
      setResponse(`Failed to fetch data: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  return (
    <div>
      <ParametersWidget
        path={apiPath}
        dispatchRequest={dispatchRequest}
        status={status}
        baseURL={src}
        initialIDValue={exampleId}
      />
      <Result status={status} response={response} />
    </div>
  )
}

const Result = ({ status, response }: { status: string; response: unknown }) => (
  <div>
    {status === RESPONSE_STATUS.ERROR && <ErrorMessage message={String(response ?? '')} />}
    {status === RESPONSE_STATUS.PENDING && <Spinner />}
    {/*status === RESPONSE_STATUS.SUCCESS && (
			<div style={{ marginTop: '1rem' }}>
				<JSONLiteral data={response} />
			</div>
		)*/}
  </div>
)

const buildPaginationQueryString = ({
  baseURL,
  path,
  pageNumber,
  perPage
}: {
  baseURL: string
  path: string
  pageNumber: number
  perPage: number
}) => `${baseURL}${path}?&page=${pageNumber}&per_page=${perPage}`

const buildIDQueryString = ({
  baseURL,
  path,
  idValue
}: {
  baseURL: string
  path: string
  idValue: string | number
}) => `${baseURL}${path.replace('{id}', '')}${idValue}`

const buildRootQueryString = ({ baseURL, path }: { baseURL: string; path: string }) =>
  `${baseURL}${path}`

interface ParametersWidgetProps {
  baseURL: string
  path: string
  status: string
  dispatchRequest: (q: string) => void
  initialIDValue?: string
}

const ParametersWidget = (props: ParametersWidgetProps) => {
  let C = ParametersWidgetPaged

  if (props.initialIDValue) {
    C = ParametersWidgetID
  }

  if (props.path === '/') {
    C = ParametersWidgetRoot
  }

  return <C {...props} />
}

const ParametersWidgetRoot = ({
  baseURL,
  path,
  status,
  dispatchRequest
}: {
  baseURL: string
  path: string
  status: string
  dispatchRequest: (q: string) => void
}) => (
  <div>
    <MakeRequest
      dispatchRequest={dispatchRequest}
      status={status}
      query={buildRootQueryString({
        baseURL: baseURL,
        path: path
      })}
    />
  </div>
)

const ParametersWidgetID = ({
  baseURL,
  path,
  status,
  dispatchRequest,
  initialIDValue
}: {
  baseURL: string
  path: string
  status: string
  dispatchRequest: (q: string) => void
  initialIDValue?: string
}) => {
  const [idValue, setIdValue] = useState<string>(initialIDValue || '')
  const handleIdValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIdValue(event.target.value)
  }

  return (
    <div>
      <h3>Parameters</h3>
      <Columns layout='11'>
        <div>
          <label>
            <span className={styles.words}>id: </span>
            <input maxLength={100} value={idValue} onChange={handleIdValueChange} />
          </label>
        </div>
        <div></div>
      </Columns>
      <MakeRequest
        dispatchRequest={dispatchRequest}
        status={status}
        query={buildIDQueryString({
          baseURL: baseURL,
          path: path,
          idValue: idValue
        })}
      />
    </div>
  )
}

const ParametersWidgetPaged = ({
  baseURL,
  path,
  status,
  dispatchRequest
}: {
  baseURL: string
  path: string
  status: string
  dispatchRequest: (q: string) => void
}) => {
  const [pageNumber, setPageNumber] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const handlePageNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPageNumber(parseInt(event.target.value))
  }

  const handlePerPageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setPerPage(parseInt(event.target.value))
  }
  return (
    <div className={styles.form}>
      <h3>Parameters</h3>
      <Columns layout='11'>
        <div>
          <label>
            <span className={styles.words}>Page Number:</span>
            <input type='number' value={pageNumber} onChange={handlePageNumberChange} min={1} />
          </label>
        </div>
        <div>
          <label>
            <span className={styles.words}>Per Page:</span>
            <select value={perPage} onChange={handlePerPageChange}>
              <optgroup>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </optgroup>
            </select>
          </label>
        </div>
      </Columns>
      <MakeRequest
        dispatchRequest={dispatchRequest}
        status={status}
        query={buildPaginationQueryString({
          baseURL: baseURL,
          path: path,
          pageNumber: pageNumber,
          perPage: perPage
        })}
      />
    </div>
  )
}

interface MakeRequestProps {
  query: string
  status?: string
  dispatchRequest?: (q: string) => void
}

const MakeRequest = ({ query }: MakeRequestProps) => (
  <div>
    <h3>Request</h3>

    <code className={styles.query}>{query}</code>
    <div>
      {isHttpUrl(query) ? (
        <>
          Load the API response&nbsp;
          <a href={query} target='_blank' rel='noopener noreferrer'>
            in a new window
          </a>
        </>
      ) : (
        <>This request cannot be opened: the feed URL is not an http or https address.</>
      )}
      {/*
				
				remove pending fix to json component loading
				
			{status === RESPONSE_STATUS.INIITIAL && (
				<>
					&nbsp;or&nbsp;
					<Button q={query} dispatchRequest={dispatchRequest} text='inline below' />
				</>
			)}
			{status === RESPONSE_STATUS.ERROR && (
				<>
					&nbsp;or&nbsp;
					<Button q={query} dispatchRequest={dispatchRequest} text='retry' />.
				</>
			)}
			
		*/}
    </div>
  </div>
)

/*
const Button = ({ dispatchRequest, text, q }) => (
	<button onClick={() => dispatchRequest(q)} className={styles.buttonLink}>
		{text}
	</button>
)*/

const ErrorMessage = ({ message }: { message: string }) => (
  <div
    style={{
      marginTop: '1rem',
      borderColor: 'var(--VersionedDocumentation-legacy-border-color)',
      background: 'var(--VersionedDocumentation-legacy-background)',
      color: 'var(--VersionedDocumentation-legacy-color)',
      padding: '2rem',
      fontWeight: '900'
    }}
  >
    Error: Failed to load JSON. {message}{' '}
    <span style={{ fontWeight: 300 }}>
      <br />
      (This may be a Cross Origin Resource Sharing error - try loading the API in a new window
      instead)
    </span>
  </div>
)
