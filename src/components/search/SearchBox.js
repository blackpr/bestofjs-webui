import React, { useContext, useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import Select, { components } from 'react-select'
import useDebouncedCallback from 'use-debounce/lib/useDebouncedCallback'
import styled from 'styled-components/macro' // eslint-disable-line no-unused-vars

import { SearchContext } from './SearchProvider'
import { getAllTags } from '../../selectors'
import { Button } from '../core'

export const SearchBox = () => {
  const tags = useSelector(getAllTags)
  const { query, selectedTags, onChange } = useContext(SearchContext)
  const [inputValue, setInputValue] = useState(query)
  const [debouncedOnChange, cancel] = useDebouncedCallback(onChange, 300)

  const options = [{ id: '', counter: tags.length }, ...tags].map(item => ({
    ...item,
    value: item.id,
    label: item.name
  }))

  const selectedOptions = selectedTags.map(tagId =>
    options.find(({ id }) => id === tagId)
  )

  useEffect(
    () => {
      setInputValue(query)
    },
    [query]
  )

  const selectRef = useRef()

  return (
    <div css={{ backgroundColor: 'var(--bestofjsOrange)', padding: '1rem 0' }}>
      <div className="container">
        <Select
          ref={selectRef}
          options={options}
          isMulti
          isClearable
          noOptionsMessage={() => null}
          placeholder={'Pick tags or enter keywords...'}
          onChange={(options, { action, option }) => {
            // console.log('> onChange', options, action, option)
            const tagIds = (options || []).map(({ id }) => id)
            if (action === 'select-option') {
              if (option.id === '') return
            }
            setInputValue('')
            cancel()
            onChange({ query: '', selectedTags: tagIds })
          }}
          onInputChange={(value, { action }) => {
            // console.log('onInputChange', value, action)
            if (action === 'input-change') {
              setInputValue(value)
              debouncedOnChange({ query: value })
            }
          }}
          // This `onKeyDown` event handler is used only for a specific case:
          // when the user enters text, moves the cursor just after the tag and pushes the Backspace key
          onKeyDown={event => {
            if (event.key !== 'Backspace') return
            if (selectedTags.length === 0) return
            if (query === '') return
            const {
              selectionStart,
              selectionEnd
            } = selectRef.current.select.inputRef
            if (!(selectionStart === 0 && selectionEnd === 0)) return
            console.info('Remove the last tag')
            onChange({
              query,
              selectedTags: selectedTags.slice(0, selectedTags.length - 1)
            })
          }}
          inputValue={inputValue}
          value={selectedOptions}
          components={customComponents}
          theme={theme => ({
            ...theme,
            colors: {
              ...theme.colors,
              primary: '#9c0042',
              primary75: '#f76d42',
              primary50: '#ffae63',
              primary25: '#f6fad7'
            }
          })}
        />
      </div>
    </div>
  )
}

// Customize the default `Option` component provided by `react-select`
const { Option, IndicatorsContainer } = components
const { CrossIcon } = components

const CustomOption = props => {
  const { id, name, counter } = props.data
  return (
    <Option {...props}>
      {id ? (
        <>
          {name} <span className="text-secondary">({counter})</span>
        </>
      ) : (
        <>
          Pick a tag...{'  '}
          <span className="text-secondary">({counter} tags available)</span>
        </>
      )}
    </Option>
  )
}

const ResetButton = styled(Button)`
  padding: 2px 5px;
  margin-right: '0.5rem';
  color: #ababab;
  &:hover {
    #999999;
  }
  border-style: none;
`

const customComponents = {
  Option: CustomOption,
  IndicatorsContainer: ({ children, ...props }) => {
    const { hasValue } = props // the selected tags
    const { inputValue } = props.selectProps // the query
    return (
      <IndicatorsContainer {...props}>
        {inputValue && !hasValue && (
          <ResetButton style={{}} onClick={() => props.setValue()}>
            <CrossIcon />
          </ResetButton>
        )}
        {children}
      </IndicatorsContainer>
    )
  }
}

/* 


<ClearIndicator {...props} onClick={() => props.setValue()} />
*/
